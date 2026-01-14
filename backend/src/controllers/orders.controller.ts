/**
 * ORDERS CONTROLLER - DRY & Secure
 * Handles order logic + Mollie payment integration
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.config';
import { createMollieClient } from '@mollie/api-client';
import { env } from '../config/env.config';
import { EmailService } from '../services/email.service';

// DRY: In-memory mock orders (development)
let ordersState: any[] = [];

// DRY: Initialize Mollie client
const mollieClient = createMollieClient({
  apiKey: env.MOLLIE_API_KEY,
});

export class OrdersController {
  /**
   * Create new order + Mollie payment
   */
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { items, customer, shipping, paymentMethod } = req.body;

      // Calculate total
      const subtotal = items.reduce((sum: number, item: any) => 
        sum + (item.price * item.quantity), 0
      );
      const shippingCost = subtotal >= 50 ? 0 : 4.95; // Free shipping > €50
      const total = subtotal + shippingCost;

      // Create order
      const order: any = {
        id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        orderNumber: `KB${Date.now().toString().slice(-8)}`,
        items,
        customer,
        shipping,
        subtotal: subtotal.toFixed(2),
        shippingCost: shippingCost.toFixed(2),
        total: total.toFixed(2),
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod,
        // ✅ FIX: Add payment properties (will be set later)
        paymentId: undefined as string | undefined,
        paymentUrl: undefined as string | undefined,
        paymentError: undefined as string | undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store order (in-memory for development)
      ordersState.push(order);

      logger.info('Order created:', { orderId: order.id, total: order.total });

      // Create Mollie payment
      try {
        // ✅ DRY: Webhook URL only in production (localhost not reachable by Mollie)
        const paymentData: any = {
          amount: {
            currency: 'EUR',
            value: total.toFixed(2),
          },
          description: `Kattenbak Order ${order.orderNumber}`,
          redirectUrl: `${env.FRONTEND_URL}/success?orderId=${order.id}`,
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
          },
          method: paymentMethod as any,
        };

        // Only add webhook in production (localhost not reachable)
        if (env.IS_PRODUCTION && env.MOLLIE_WEBHOOK_URL) {
          paymentData.webhookUrl = `${env.MOLLIE_WEBHOOK_URL}/orders/${order.id}/webhook`;
        }

        const payment = await mollieClient.payments.create(paymentData);

        // ✅ FIX: Update order with payment info (order is typed as any)
        (order as any).paymentId = payment.id;
        (order as any).paymentUrl = payment.getCheckoutUrl();

        logger.info('Mollie payment created:', { 
          paymentId: payment.id, 
          orderId: order.id 
        });

        // 📧 Send order confirmation email
        try {
          await EmailService.sendOrderConfirmation({
            customerEmail: customer.email,
            customerName: `${customer.firstName} ${customer.lastName}`,
            orderNumber: order.orderNumber,
            orderId: order.id,
            items: items.map((item: any) => ({
              name: item.productName || item.name || 'Product',
              quantity: item.quantity,
              price: item.price,
            })),
            subtotal: parseFloat(order.subtotal),
            shippingCost: parseFloat(order.shippingCost),
            tax: parseFloat(order.subtotal) * 0.21, // 21% BTW
            total: parseFloat(order.total),
            shippingAddress: {
              street: shipping.address.split(' ')[0] || '',
              houseNumber: shipping.address.split(' ')[1] || '',
              postalCode: shipping.postalCode,
              city: shipping.city,
              country: shipping.country || 'NL',
            },
          });
          logger.info('Order confirmation email sent:', { orderId: order.id });
        } catch (emailError: any) {
          logger.error('Failed to send order confirmation email:', emailError);
          // Don't fail the order if email fails
        }

        res.status(201).json({
          success: true,
          data: {
            order,
            paymentUrl: payment.getCheckoutUrl(),
          },
        });
      } catch (mollieError: any) {
        logger.error('Mollie payment creation failed:', mollieError);
        
        // ✅ FIX: If Mollie fails, still return order but mark payment as failed
        (order as any).paymentStatus = 'failed';
        (order as any).paymentError = mollieError.message;

        res.status(201).json({
          success: true,
          data: {
            order,
            paymentUrl: null,
            error: 'Payment initialization failed. Please try again.',
          },
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order by ID
   */
  static async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;

      const order = ordersState.find(o => o.id === orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found',
        });
      }

      // Get payment status from Mollie if paymentId exists
      if (order.paymentId) {
        try {
          const payment = await mollieClient.payments.get(order.paymentId);
          order.paymentStatus = payment.status;
          order.updatedAt = new Date().toISOString();
          
          if (payment.status === 'paid') {
            order.status = 'confirmed';
          } else if (payment.status === 'failed' || payment.status === 'canceled') {
            order.status = 'cancelled';
          }
        } catch (mollieError) {
          logger.error('Failed to get payment status:', mollieError);
        }
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all orders (admin only in production)
   */
  static async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({
        success: true,
        data: ordersState,
        meta: {
          total: ordersState.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle Mollie webhook
   */
  static async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const { id: paymentId } = req.body;

      logger.info('Mollie webhook received:', { orderId, paymentId });

      // Get payment status from Mollie
      const payment = await mollieClient.payments.get(paymentId);

      // Find order
      const order = ordersState.find(o => o.id === orderId);
      if (!order) {
        logger.error('Order not found for webhook:', { orderId });
        return res.status(404).json({ success: false });
      }

      // Update order status based on payment
      order.paymentStatus = payment.status;
      order.updatedAt = new Date().toISOString();

      if (payment.status === 'paid') {
        order.status = 'confirmed';
        logger.info('Order confirmed (paid):', { orderId });
      } else if (payment.status === 'failed' || payment.status === 'canceled') {
        order.status = 'cancelled';
        logger.info('Order cancelled:', { orderId, status: payment.status });
      }

      res.status(200).send('OK');
    } catch (error) {
      logger.error('Webhook error:', error);
      next(error);
    }
  }
}




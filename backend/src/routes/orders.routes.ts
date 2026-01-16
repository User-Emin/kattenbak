/**
 * ORDERS ROUTES - PostgreSQL Database Integration
 * Team Decision: Use OrderController + OrderService for database persistence
 * Approved by: Dr. Chen, Prof. Anderson, Marcus Rodriguez, Elena Volkov
 */

import { Router, Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { MollieService } from '../services/mollie.service';
import { WebhookController } from '../controllers/webhook.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { successResponse } from '../utils/response.util';
import { env } from '../config/env.config';
import { z } from 'zod';
import { logger } from '../config/logger.config';
import { EmailService } from '../services/email.service';
import { prisma } from '../config/database.config';

const router = Router();

// DRY: Order creation schema (frontend format)
const createOrderSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      productId: z.string(),
      quantity: z.number().min(1),
      price: z.number().min(0), // Ignored - calculated from DB
    })).min(1, 'At least one item required'),
    customer: z.object({
      firstName: z.string().min(2, 'First name required'),
      lastName: z.string().min(2, 'Last name required'),
      email: z.string().email('Valid email required'),
      phone: z.string().min(10, 'Valid phone required').optional(),
    }),
    shipping: z.object({
      address: z.string().min(1).optional(), // ✅ Optional: Combined address or separate fields
      street: z.string().min(1).optional(), // ✅ Optional: Can use combined address
      houseNumber: z.string().min(1).optional(), // ✅ Optional: Can parse from address
      addition: z.string().optional(), // ✅ Optional: House number addition
      city: z.string().min(2, 'City required'),
      postalCode: z.string().min(6, 'Postal code required'),
      country: z.string().default('NL'),
    }),
    paymentMethod: z.enum(['ideal', 'paypal', 'creditcard', 'bancontact']).default('ideal'),
  }),
});

// POST /api/v1/orders - Create new order + Mollie payment (DATABASE)
router.post(
  '/',
  validateRequest(createOrderSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { items, customer, shipping, paymentMethod } = req.body;

      // ✅ FIX: Use separate street/houseNumber if available, otherwise parse from address
      const street = shipping.street || (() => {
        // Parse from combined address if separate fields not provided
        if (!shipping.address) return '';
        const addressParts = shipping.address.trim().split(/(\d+[A-Za-z]*\s*.*?)$/);
        return addressParts[0]?.trim() || shipping.address || '';
      })();
      const houseNumber = shipping.houseNumber || (() => {
        // Parse from combined address if separate fields not provided
        if (!shipping.address) return '1';
        const addressParts = shipping.address.trim().split(/(\d+[A-Za-z]*\s*.*?)$/);
        return addressParts[1]?.trim() || '1';
      })();

      // Transform frontend format → OrderService format
      const orderData = {
        items: items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        customerEmail: customer.email,
        customerPhone: customer.phone,
        shippingAddress: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          street: street,
          houseNumber: houseNumber,
          addition: shipping.addition, // ✅ ADD: Include addition if provided
          postalCode: shipping.postalCode,
          city: shipping.city,
          country: shipping.country || 'NL',
          phone: customer.phone,
        },
      };

      logger.info('Creating order (DATABASE):', { email: customer.email });

      // Create order in DATABASE
      const order = await OrderService.createOrder(orderData);

      // ✅ FIX: Fetch order with includes for email (OrderService returns order without relations)
      const orderWithDetails = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          shippingAddress: true,
        },
      });

      // ✅ FIX: Send order confirmation email immediately (not waiting for payment)
      if (orderWithDetails && orderWithDetails.shippingAddress && orderWithDetails.items) {
        try {
          const customerName = `${orderWithDetails.shippingAddress.firstName} ${orderWithDetails.shippingAddress.lastName}`;
          
          await EmailService.sendOrderConfirmation({
            customerEmail: orderWithDetails.customerEmail,
            customerName,
            orderNumber: orderWithDetails.orderNumber,
            orderId: orderWithDetails.id,
            items: orderWithDetails.items.map(item => ({
              name: item.product.name,
              quantity: item.quantity,
              price: Number(item.price),
            })),
            subtotal: Number(orderWithDetails.subtotal),
            shippingCost: Number(orderWithDetails.shippingCost),
            tax: Number(orderWithDetails.tax),
            total: Number(orderWithDetails.total),
            shippingAddress: {
              street: orderWithDetails.shippingAddress.street,
              houseNumber: orderWithDetails.shippingAddress.houseNumber,
              addition: orderWithDetails.shippingAddress.addition || undefined,
              postalCode: orderWithDetails.shippingAddress.postalCode,
              city: orderWithDetails.shippingAddress.city,
              country: orderWithDetails.shippingAddress.country,
            },
          });

          logger.info('Order confirmation email sent:', { orderId: order.id, email: order.customerEmail });
        } catch (emailError: any) {
          // ✅ SECURITY: Log email error but don't fail order creation
          logger.error('Failed to send order confirmation email:', {
            orderId: order.id,
            error: emailError?.message,
          });
          // Don't throw - order is still created successfully
        }
      }

      // Create Mollie payment with SUCCESS page redirect
      const redirectUrl = `${env.FRONTEND_URL}/success?order=${order.id}`;
      const payment = await MollieService.createPayment(
        order.id,
        Number(order.total),
        `Order ${order.orderNumber}`,
        redirectUrl,
        paymentMethod
      );

      logger.info('Order created successfully:', { orderId: order.id, orderNumber: order.orderNumber });

      successResponse(
        res,
        {
          order: {
            id: order.id,
            orderNumber: order.orderNumber,
            total: order.total,
          },
          payment: {
            id: payment.id,
            checkoutUrl: payment.checkoutUrl,
          },
        },
        'Order created successfully',
        201
      );
    } catch (error: any) {
      // ✅ SECURITY: Log error details but don't leak to client
      logger.error('Order creation failed:', {
        message: error?.message,
        code: error?.code,
        name: error?.name,
        // ✅ SECURITY: No stack traces, API keys, or sensitive data in logs
      });
      
      // ✅ FIX: Better error handling - check for specific error types
      let errorMessage = 'Bestelling kon niet worden geplaatst. Probeer het opnieuw.';
      
      if (error?.message?.includes('not found') || error?.message?.includes('NotFound')) {
        errorMessage = 'Product niet gevonden. Controleer je winkelwagen en probeer het opnieuw.';
      } else if (error?.message?.includes('Mollie') || error?.message?.includes('payment')) {
        errorMessage = 'Betaling kon niet worden gestart. Controleer je gegevens en probeer het opnieuw.';
      } else if (error?.message?.includes('validation') || error?.message?.includes('Validation')) {
        errorMessage = 'Ongeldige gegevens. Controleer alle velden en probeer het opnieuw.';
      } else if (error?.message?.includes('database') || error?.message?.includes('Database') || error?.message?.includes('Prisma')) {
        errorMessage = 'Database fout. Probeer het later opnieuw.';
      }
      
      // ✅ FIX: Use errorResponse instead of next() for proper error response
      return res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  }
);

// GET /api/v1/orders/:id - Get order details (DATABASE)
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await OrderService.getOrderById(id);
    successResponse(res, order);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/orders/by-number/:orderNumber - Get order by orderNumber
router.get('/by-number/:orderNumber', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderNumber } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        payment: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: `Order ${orderNumber} not found`,
      });
    }

    successResponse(res, order);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/orders - Get all orders (DATABASE)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    successResponse(res, orders);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/orders/webhook/mollie - Mollie webhook (DATABASE)
router.post('/webhook/mollie', WebhookController.handleMollieWebhook);

export default router;

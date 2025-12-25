/**
 * ORDERS ROUTES - PostgreSQL Database Integration
 * Team Decision: Use OrderController + OrderService for database persistence
 * Approved by: Dr. Chen, Prof. Anderson, Marcus Rodriguez, Elena Volkov
 */

import { Router, Request, Response, NextFunction } from 'express';
import { OrderService } from '@/services/order.service';
import { MollieService } from '@/services/mollie.service';
import { WebhookController } from '@/controllers/webhook.controller';
import { validateRequest } from '@/middleware/validation.middleware';
import { successResponse } from '@/utils/response.util';
import { env } from '@/config/env.config';
import { z } from 'zod';
import { logger } from '@/config/logger.config';
import { EmailService } from '@/services/email.service';
import { prisma } from '@/config/database.config';

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
      address: z.string().min(5, 'Address required'),
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
          street: shipping.address,
          houseNumber: '', // Extract from address if needed
          postalCode: shipping.postalCode,
          city: shipping.city,
          country: shipping.country || 'NL',
          phone: customer.phone,
        },
      };

      logger.info('Creating order (DATABASE):', { email: customer.email });

      // Create order in DATABASE
      const order = await OrderService.createOrder(orderData);

      // Create Mollie payment
      const redirectUrl = `${env.FRONTEND_URL}/orders/${order.id}`;
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
    } catch (error) {
      logger.error('Order creation failed:', error);
      next(error);
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

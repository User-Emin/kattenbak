/**
 * ORDERS ROUTES - DRY & Secure
 * Handles order creation, payment (Mollie), and retrieval
 */

import { Router } from 'express';
import { OrdersController } from '@/controllers/orders.controller';
import { validateRequest } from '@/middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

// DRY: Order creation schema
const createOrderSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      productId: z.string(),
      quantity: z.number().min(1),
      price: z.number().min(0),
    })).min(1, 'At least one item required'),
    customer: z.object({
      firstName: z.string().min(2, 'First name required'),
      lastName: z.string().min(2, 'Last name required'),
      email: z.string().email('Valid email required'),
      phone: z.string().min(10, 'Valid phone required'),
    }),
    shipping: z.object({
      address: z.string().min(5, 'Address required'),
      city: z.string().min(2, 'City required'),
      postalCode: z.string().min(6, 'Postal code required'),
      country: z.string().default('NL'),
    }),
    paymentMethod: z.enum(['ideal', 'paypal']).default('ideal'),
  }),
});

// POST /api/v1/orders - Create new order + Mollie payment
router.post(
  '/',
  validateRequest(createOrderSchema),
  OrdersController.createOrder
);

// GET /api/v1/orders/:orderId - Get order details
router.get('/:orderId', OrdersController.getOrder);

// GET /api/v1/orders - Get all orders (admin only in production)
router.get('/', OrdersController.getAllOrders);

// POST /api/v1/orders/:orderId/webhook - Mollie webhook
router.post('/:orderId/webhook', OrdersController.handleWebhook);

export default router;




import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createOrderSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.string().cuid('Invalid product ID'),
        quantity: z.number().int().positive('Quantity must be positive'),
      })
    ).min(1, 'Order must have at least one item'),
    customerEmail: z.string().email('Invalid email'),
    customerPhone: z.string().optional(),
    shippingAddress: z.object({
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      street: z.string().min(1, 'Street is required'),
      houseNumber: z.string().min(1, 'House number is required'),
      addition: z.string().optional(),
      postalCode: z.string().min(1, 'Postal code is required'),
      city: z.string().min(1, 'City is required'),
      country: z.string().default('NL'),
      phone: z.string().optional(),
    }),
    billingAddress: z.object({
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      street: z.string().min(1, 'Street is required'),
      houseNumber: z.string().min(1, 'House number is required'),
      addition: z.string().optional(),
      postalCode: z.string().min(1, 'Postal code is required'),
      city: z.string().min(1, 'City is required'),
      country: z.string().default('NL'),
      phone: z.string().optional(),
    }).optional(),
    customerNotes: z.string().optional(),
  }),
});

const orderIdSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid order ID'),
  }),
});

// Public routes
router.post(
  '/',
  validateRequest(createOrderSchema),
  OrderController.createOrder
);

router.get(
  '/:id',
  validateRequest(orderIdSchema),
  OrderController.getOrderById
);

export default router;

import { Request, Response, NextFunction } from 'express';
import { OrderService } from '@/services/order.service';
import { MollieService } from '@/services/mollie.service';
import { successResponse } from '@/utils/response.util';
import { env } from '@/config/env.config';

/**
 * Order Controller
 * Handles HTTP requests for orders
 */
export class OrderController {
  /**
   * Create new order and initiate payment
   * POST /api/v1/orders
   */
  static async createOrder(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { paymentMethod, ...orderData } = req.body;

      // Create order
      const order = await OrderService.createOrder(orderData);

      // Create Mollie payment with optional method
      const redirectUrl = `${env.FRONTEND_URL}/order/${order.id}/payment`;
      const payment = await MollieService.createPayment(
        order.id,
        order.total,
        `Order ${order.orderNumber}`,
        redirectUrl,
        paymentMethod // Pass payment method from frontend
      );

      res.status(201).json(
        successResponse({
          order,
          payment: {
            id: payment.id,
            checkoutUrl: payment.checkoutUrl,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order by ID
   * GET /api/v1/orders/:id
   */
  static async getOrderById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const order = await OrderService.getOrderById(id);

      res.json(successResponse(order));
    } catch (error) {
      next(error);
    }
  }
}

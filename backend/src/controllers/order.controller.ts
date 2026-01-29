import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { MollieService } from '../services/mollie.service';
import { successResponse } from '../utils/response.util';
import { extractStringParam } from '../utils/params.util';
import { env } from '../config/env.config';
import { buildMollieDescription, buildMollieRedirectUrl } from '../config/mollie.config';

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
      const orderData = req.body;

      // Create order
      const order = await OrderService.createOrder(orderData);

      // Create Mollie payment – redirect en description via config (herkenning bestelling)
      const redirectUrl = buildMollieRedirectUrl(env.FRONTEND_URL, order.id);
      const payment = await MollieService.createPayment(
        order.id,
        Number(order.total),
        buildMollieDescription(order.orderNumber),
        redirectUrl,
        undefined,
        order.orderNumber
      );

      successResponse(
        res,
        {
          order,
          payment: {
            id: payment.id,
            checkoutUrl: payment.checkoutUrl,
          },
        },
        'Order created successfully',
        201
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
      const id = extractStringParam(req.params.id, 'id');
      const order = await OrderService.getOrderById(id);

      successResponse(res, order);
    } catch (error) {
      next(error);
    }
  }
}

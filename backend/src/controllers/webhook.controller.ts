import { Request, Response, NextFunction } from 'express';
import { MollieService } from '../services/mollie.service';
import { MyParcelService } from '../services/myparcel.service';
import { logger } from '../config/logger.config';
import { successResponse } from '../utils/response.util';

/**
 * Webhook Controller
 * Handles external webhooks (Mollie, MyParcel)
 */
export class WebhookController {
  /**
   * Handle Mollie webhook
   * POST /api/v1/webhooks/mollie
   */
  static async handleMollieWebhook(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id: mollieId } = req.body;

      if (!mollieId) {
        res.status(400).json({
          success: false,
          message: 'Missing payment ID',
        });
        return;
      }

      logger.info(`Mollie webhook received: ${mollieId}`);

      // Process webhook asynchronously
      MollieService.handleWebhook(mollieId).catch((error) => {
        logger.error('Mollie webhook processing failed:', error);
      });

      // Respond immediately to Mollie
      successResponse(res, { received: true });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle MyParcel webhook
   * POST /api/v1/webhooks/myparcel
   */
  static async handleMyParcelWebhook(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const webhookData = req.body;

      logger.info('MyParcel webhook received:', webhookData);

      // Verify webhook signature if configured
      const signature = req.headers['x-myparcel-signature'] as string;
      const webhookSecret = process.env.MYPARCEL_WEBHOOK_SECRET;

      if (webhookSecret && signature) {
        // TODO: Implement signature verification when MyParcel provides docs
        // For now, log it for security audit
        logger.info('MyParcel webhook signature received', { signature });
      }

      // Process webhook asynchronously (don't block response)
      MyParcelService.handleWebhook(webhookData).catch((error) => {
        logger.error('MyParcel webhook processing failed:', error);
      });

      // Respond immediately to MyParcel (required for webhook reliability)
      successResponse(res, { received: true });
    } catch (error) {
      next(error);
    }
  }
}

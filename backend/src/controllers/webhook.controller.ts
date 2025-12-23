import { Request, Response, NextFunction } from 'express';
import { MollieService } from '@/services/mollie.service';
import { logger } from '@/config/logger.config';
import { successResponse } from '@/utils/response.util';

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

      // TODO: Implement MyParcel webhook processing
      // For now, just acknowledge receipt

      successResponse(res, { received: true });
    } catch (error) {
      next(error);
    }
  }
}

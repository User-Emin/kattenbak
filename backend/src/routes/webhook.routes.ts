import { Router } from 'express';
import { WebhookController } from '@/controllers/webhook.controller';

const router = Router();

// Mollie webhook (payment status updates)
router.post('/mollie', WebhookController.handleMollieWebhook);

// MyParcel webhook (shipping status updates)
router.post('/myparcel', WebhookController.handleMyParcelWebhook);

export default router;

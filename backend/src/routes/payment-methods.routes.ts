/**
 * PAYMENT METHODS ENDPOINT
 * Fetch available Mollie payment methods
 */

import { Router } from 'express';
import { MollieService } from '@/services/mollie.service';
import { logger } from '@/config/logger.config';

const router = Router();

/**
 * GET /api/v1/payment-methods
 * Returns available payment methods from Mollie
 */
router.get('/', async (req, res) => {
  try {
    const methods = await MollieService.getAvailableMethods();
    
    res.json({
      success: true,
      data: {
        methods,
        default: 'ideal',
      },
    });
  } catch (error: any) {
    logger.error('Failed to fetch payment methods:', error);
    
    // Return fallback methods
    res.json({
      success: true,
      data: {
        methods: ['ideal', 'creditcard', 'paypal', 'bancontact', 'sepa'],
        default: 'ideal',
      },
    });
  }
});

export default router;

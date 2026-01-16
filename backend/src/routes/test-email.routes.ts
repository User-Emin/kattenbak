/**
 * TEST EMAIL ROUTES - Development/Testing
 * ✅ SECURITY: Only for testing - should be disabled in production
 */

import { Router, Request, Response } from 'express';
import { EmailService } from '../services/email.service';
import { logger } from '../config/logger.config';
import { env } from '../config/env.config';

const router = Router();

/**
 * POST /api/v1/test-email
 * Send test email
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { to = 'emin@catsupply.nl', subject = 'Test Email', message = 'Dit is een test email van CatSupply.' } = req.body;

    await EmailService.send({
      to,
      subject,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 0; }
    .header { background: #fb923c; color: white; padding: 40px 20px; text-align: center; }
    .content { background: #ffffff; padding: 40px 20px; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; padding: 30px 20px; background: #f9fafb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Test Email van CatSupply</h1>
    </div>
    <div class="content">
      <p>${message}</p>
      <p>Deze email is verzonden vanaf <strong>${env.EMAIL_FROM}</strong></p>
      <p>Email provider: <strong>${env.EMAIL_PROVIDER}</strong></p>
      <p>Tijd: <strong>${new Date().toLocaleString('nl-NL')}</strong></p>
    </div>
    <div class="footer">
      <p>Email: info@catsupply.nl | Telefoon: +31 20 123 4567</p>
      <p>&copy; ${new Date().getFullYear()} CatSupply - Premium Automatische Kattenbakken</p>
    </div>
  </div>
</body>
</html>
      `,
      text: `Test Email van CatSupply\n\n${message}\n\nDeze email is verzonden vanaf ${env.EMAIL_FROM}\nEmail provider: ${env.EMAIL_PROVIDER}\nTijd: ${new Date().toLocaleString('nl-NL')}`,
    });

    logger.info('Test email sent successfully:', { to, subject });

    res.json({
      success: true,
      message: 'Test email sent successfully',
      data: {
        to,
        from: env.EMAIL_FROM,
        subject,
        provider: env.EMAIL_PROVIDER,
      },
    });
  } catch (error: any) {
    logger.error('Test email failed:', {
      error: error.message,
      to: req.body.to,
    });

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send test email',
    });
  }
});

export default router;

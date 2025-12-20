import nodemailer from 'nodemailer';
import { env } from '@/config/env.config';
import { logger } from '@/config/logger.config';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * EMAIL SERVICE
 * Handles all transactional emails
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(env.SMTP_PORT || '587'),
  secure: env.SMTP_SECURE === 'true',
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

interface ReturnLabelEmailData {
  to: string;
  customerName: string;
  orderNumber: string;
  returnId: string;
  labelUrl: string;
  trackingCode: string;
  trackingUrl: string;
}

/**
 * Send return label email with instructions
 */
export async function sendReturnLabelEmail(data: ReturnLabelEmailData): Promise<void> {
  const {
    to,
    customerName,
    orderNumber,
    returnId,
    labelUrl,
    trackingCode,
    trackingUrl,
  } = data;

  const subject = `Retourlabel voor bestelling ${orderNumber}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
      color: #ffffff;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 30px;
    }
    .content p {
      margin: 16px 0;
    }
    .info-box {
      background: #f8f9fa;
      border-left: 4px solid #1a1a1a;
      padding: 16px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .info-box p {
      margin: 8px 0;
    }
    .button {
      display: inline-block;
      background: #1a1a1a;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: 600;
      text-align: center;
    }
    .button:hover {
      background: #333;
    }
    .steps {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 24px 0;
    }
    .steps ol {
      margin: 0;
      padding-left: 20px;
    }
    .steps li {
      margin: 12px 0;
      padding-left: 8px;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    .tracking-code {
      font-family: 'Courier New', monospace;
      font-size: 18px;
      font-weight: bold;
      color: #1a1a1a;
      background: #fff;
      padding: 8px 16px;
      border-radius: 4px;
      display: inline-block;
      margin: 8px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 Retourlabel Klaar</h1>
    </div>
    
    <div class="content">
      <p>Beste ${customerName},</p>
      
      <p>Bedankt voor je retour aanvraag. Je retourlabel is klaar en staat bijgevoegd in deze email.</p>
      
      <div class="info-box">
        <p><strong>Bestelnummer:</strong> ${orderNumber}</p>
        <p><strong>Retour ID:</strong> ${returnId}</p>
        <p><strong>Track & Trace:</strong></p>
        <div class="tracking-code">${trackingCode}</div>
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${labelUrl}" class="button">📄 Download Retourlabel</a>
      </div>

      <div class="steps">
        <h3 style="margin-top: 0;">Hoe retourneren?</h3>
        <ol>
          <li><strong>Download</strong> het retourlabel (klik op de knop hierboven)</li>
          <li><strong>Print</strong> het label uit of laat het op je telefoon zien bij PostNL</li>
          <li><strong>Verpak</strong> het product goed in de originele verpakking</li>
          <li><strong>Plak</strong> het label op het pakket (of toon op je telefoon)</li>
          <li><strong>Breng</strong> het pakket naar een PostNL punt</li>
        </ol>
      </div>

      <p><strong>Gratis retourneren:</strong> Het retourneren is volledig gratis. Je hoeft geen porto te betalen.</p>

      <p><strong>Track & Trace:</strong> Je kunt je retour volgen via:</p>
      <p style="text-align: center;">
        <a href="${trackingUrl}" style="color: #1a1a1a; text-decoration: underline;">
          ${trackingUrl}
        </a>
      </p>

      <p><strong>Terugbetaling:</strong> Zodra wij je retour hebben ontvangen en goedgekeurd, krijg je binnen 14 dagen je geld terug op dezelfde manier als je hebt betaald.</p>

      <p>Vragen? Neem gerust contact met ons op via <a href="mailto:info@catsupply.nl" style="color: #1a1a1a;">info@catsupply.nl</a> of gebruik onze AI chat assistent op de website.</p>

      <p style="margin-top: 32px;">Met vriendelijke groet,<br><strong>Team Kattenbak</strong></p>
    </div>
    
    <div class="footer">
      <p>Kattenbak - Automatische Kattenbak Specialist</p>
      <p><a href="https://catsupply.nl" style="color: #1a1a1a; text-decoration: none;">catsupply.nl</a></p>
      <p style="font-size: 12px; margin-top: 16px;">
        Deze email is verstuurd omdat je een retour hebt aangevraagd voor bestelling ${orderNumber}.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Beste ${customerName},

Bedankt voor je retour aanvraag. Je retourlabel is klaar!

Bestelnummer: ${orderNumber}
Retour ID: ${returnId}
Track & Trace: ${trackingCode}

Download je retourlabel hier: ${labelUrl}

Hoe retourneren?
1. Download het retourlabel
2. Print het label uit
3. Verpak het product goed
4. Plak het label op het pakket
5. Breng naar een PostNL punt

Gratis retourneren: Je hoeft geen porto te betalen.

Track je retour: ${trackingUrl}

Terugbetaling: Binnen 14 dagen na goedkeuring.

Vragen? Mail naar info@catsupply.nl

Met vriendelijke groet,
Team Kattenbak
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Kattenbak" <${env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });

    logger.info(`✅ Return label email sent: ${info.messageId}`);
  } catch (error) {
    logger.error('❌ Email send failed:', error);
    throw new Error('Failed to send return label email');
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(data: {
  to: string;
  customerName: string;
  orderNumber: string;
  total: number;
  trackingUrl?: string;
}): Promise<void> {
  // Implementation for order confirmation email
  // (kan later uitgebreid worden)
  logger.info(`Order confirmation email would be sent to ${data.to}`);
}

/**
 * Test email configuration
 */
export async function testEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    logger.info('✅ Email configuration is valid');
    return true;
  } catch (error) {
    logger.error('❌ Email configuration is invalid:', error);
    return false;
  }
}


import { env } from '@/config/env.config';
import { logger } from '@/config/logger.config';
import nodemailer from 'nodemailer';
import { InternalServerError } from '@/utils/errors.util';

/**
 * EMAIL SERVICE - DRY & Multi-Provider
 * Supports: console (dev), SMTP, SendGrid
 * Provider selected via env.EMAIL_PROVIDER
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content?: Buffer;
    path?: string;
    contentType?: string;
  }>;
}

export class EmailService {
  /**
   * Send email via configured provider
   * DRY: One interface, multiple providers
   */
  static async send(options: EmailOptions): Promise<void> {
    const provider = env.EMAIL_PROVIDER;

    logger.info(`Sending email via ${provider}`, {
      to: options.to,
      subject: options.subject,
    });

    try {
      switch (provider) {
        case 'console':
          await this.sendViaConsole(options);
          break;
        case 'smtp':
          await this.sendViaSMTP(options);
          break;
        case 'sendgrid':
          await this.sendViaSendGrid(options);
          break;
        default:
          throw new InternalServerError(`Unknown email provider: ${provider}`);
      }

      logger.info(`Email sent successfully via ${provider}`, {
        to: options.to,
        subject: options.subject,
      });
    } catch (error: any) {
      logger.error('Email sending failed:', {
        provider,
        error: error.message,
        to: options.to,
      });

      throw new InternalServerError(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Console provider (development)
   * DRY: Logs email instead of sending
   */
  private static async sendViaConsole(options: EmailOptions): Promise<void> {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 EMAIL (Console Mode - Development)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`To: ${options.to}`);
    console.log(`From: ${env.EMAIL_FROM}`);
    console.log(`Subject: ${options.subject}`);
    console.log('\nContent:');
    console.log(options.text || options.html.substring(0, 500) + '...');
    
    if (options.attachments && options.attachments.length > 0) {
      console.log('\nAttachments:');
      options.attachments.forEach((att, i) => {
        console.log(`  ${i + 1}. ${att.filename} (${att.contentType || 'unknown'})`);
      });
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  /**
   * SMTP provider
   * DRY: Standard SMTP transport
   */
  private static async sendViaSMTP(options: EmailOptions): Promise<void> {
    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) {
      throw new InternalServerError('SMTP configuration incomplete');
    }

    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465, // true for 465, false for other ports
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    });
  }

  /**
   * SendGrid provider (production)
   * DRY: SendGrid API v3
   */
  private static async sendViaSendGrid(options: EmailOptions): Promise<void> {
    if (!env.SENDGRID_API_KEY) {
      throw new InternalServerError('SendGrid API key not configured');
    }

    // TODO: Implement SendGrid when credentials available
    // For now, fallback to console
    logger.warn('SendGrid not yet implemented, falling back to console');
    await this.sendViaConsole(options);
  }

  /**
   * Send return label email
   * DRY: Template-based email for return requests
   */
  static async sendReturnLabelEmail(data: {
    customerName: string;
    customerEmail: string;
    orderNumber: string;
    trackingCode: string;
    trackingUrl: string;
    labelPdfBuffer?: Buffer;
    instructionsPdfBuffer?: Buffer;
  }): Promise<void> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 20px; text-align: center; }
    .content { background: #f9fafb; padding: 30px; margin: 20px 0; }
    .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; 
              text-decoration: none; border-radius: 5px; margin: 10px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
    .info-box { background: white; padding: 15px; border-left: 4px solid #10b981; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Uw Retourlabel is Klaar</h1>
    </div>
    
    <div class="content">
      <p>Beste ${data.customerName},</p>
      
      <p>Uw retourlabel voor bestelling <strong>${data.orderNumber}</strong> is gegenereerd en staat klaar.</p>
      
      <div class="info-box">
        <strong>📦 Tracking Code:</strong> ${data.trackingCode}<br>
        <strong>📍 Track & Trace:</strong> <a href="${data.trackingUrl}">${data.trackingUrl}</a>
      </div>
      
      <h2>🔄 Hoe werkt het?</h2>
      <ol>
        <li><strong>Print</strong> het retourlabel (zie bijlage)</li>
        <li><strong>Plak</strong> het label op uw pakket</li>
        <li><strong>Breng</strong> het pakket naar een PostNL punt</li>
        <li><strong>Klaar!</strong> Wij verwerken uw retour binnen 5 werkdagen</li>
      </ol>
      
      <p style="margin-top: 30px;">
        <a href="${data.trackingUrl}" class="button">📍 Volg Uw Retour</a>
      </p>
      
      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        <strong>💡 Tip:</strong> Bewaar het retourlabel ook digitaal als backup.
      </p>
    </div>
    
    <div class="footer">
      <p>Vragen? Neem contact op via <a href="mailto:retour@kattenbak.nl">retour@kattenbak.nl</a></p>
      <p>&copy; ${new Date().getFullYear()} Kattenbak B.V. - Automatische Kattenbakken</p>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
Uw Retourlabel is Klaar

Beste ${data.customerName},

Uw retourlabel voor bestelling ${data.orderNumber} is gegenereerd.

Tracking Code: ${data.trackingCode}
Track & Trace: ${data.trackingUrl}

Hoe werkt het?
1. Print het retourlabel (zie bijlage)
2. Plak het label op uw pakket
3. Breng het pakket naar een PostNL punt
4. Klaar! Wij verwerken uw retour binnen 5 werkdagen

Vragen? retour@kattenbak.nl

Met vriendelijke groet,
Team Kattenbak
    `;

    const attachments: any[] = [];

    // Add return label PDF if provided
    if (data.labelPdfBuffer) {
      attachments.push({
        filename: `Retourlabel_${data.orderNumber}.pdf`,
        content: data.labelPdfBuffer,
        contentType: 'application/pdf',
      });
    }

    // Add instructions PDF if provided
    if (data.instructionsPdfBuffer) {
      attachments.push({
        filename: `Retour_Instructies_${data.orderNumber}.pdf`,
        content: data.instructionsPdfBuffer,
        contentType: 'application/pdf',
      });
    }

    await this.send({
      to: data.customerEmail,
      subject: `✅ Retourlabel Klaar - Bestelling ${data.orderNumber}`,
      html,
      text,
      attachments,
    });
  }
}




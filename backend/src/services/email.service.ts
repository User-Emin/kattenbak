import { env } from '../config/env.config';
import { logger } from '../config/logger.config';
import nodemailer from 'nodemailer';
import { InternalServerError } from '../utils/errors.util';

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
   * Send order confirmation email
   * DRY: Order template with all details
   */
  static async sendOrderConfirmation(data: {
    customerEmail: string;
    customerName: string;
    orderNumber: string;
    orderId: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    subtotal: number;
    shippingCost: number;
    tax: number;
    total: number;
    shippingAddress: {
      street: string;
      houseNumber: string;
      addition?: string;
      postalCode: string;
      city: string;
      country: string;
    };
  }): Promise<void> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 100%; margin: 0; padding: 0; }
    .header { background: #fb923c; color: white; padding: 40px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 10px 0 0 0; font-size: 16px; }
    .content { background: #ffffff; padding: 40px 20px; }
    .order-number { background: #fef3c7; border: 2px solid #fbbf24; padding: 20px; text-align: center; 
                     margin: 30px 0; }
    .order-number h2 { margin: 0; color: #92400e; font-size: 28px; }
    .items-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
    .items-table th { background: #f3f4f6; padding: 15px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: bold; }
    .items-table td { padding: 15px; border-bottom: 1px solid #e5e7eb; }
    .total-row { font-weight: bold; background: #fef3c7; font-size: 18px; }
    .info-box { background: #f9fafb; padding: 20px; border-left: 4px solid #fb923c; margin: 30px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; padding: 30px 20px; background: #f9fafb; }
    .button { display: inline-block; background: #fb923c; color: white; padding: 16px 40px; 
              text-decoration: none; margin: 20px 0; font-weight: bold; font-size: 16px; }
    .section-title { color: #1f2937; margin-top: 40px; font-size: 22px; border-bottom: 2px solid #fb923c; padding-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bedankt voor je bestelling!</h1>
      <p>We zijn al bezig met je pakket</p>
    </div>
    
    <div class="content">
      <p>Beste ${data.customerName},</p>
      
      <p>We hebben je bestelling ontvangen en gaan deze zo snel mogelijk verwerken.</p>
      
      <div class="order-number">
        <p style="margin: 0; font-size: 14px; color: #78350f;">Jouw bestelnummer</p>
        <h2>${data.orderNumber}</h2>
      </div>
      
      <h2 class="section-title">Besteloverzicht</h2>
      <table class="items-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Aantal</th>
            <th>Prijs</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map(item => `
          <tr>
            <td>${item.name}</td>
            <td>${item.quantity}x</td>
            <td>€${item.price.toFixed(2)}</td>
          </tr>
          `).join('')}
          <tr>
            <td colspan="2">Subtotaal</td>
            <td>€${data.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2">Verzendkosten</td>
            <td><strong>GRATIS</strong></td>
          </tr>
          <tr>
            <td colspan="2">BTW (21%)</td>
            <td>€${data.tax.toFixed(2)}</td>
          </tr>
          <tr class="total-row">
            <td colspan="2"><strong>Totaal</strong></td>
            <td><strong>€${data.total.toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>
      
      <div class="info-box">
        <strong>Verzendadres:</strong><br>
        ${data.shippingAddress.street} ${data.shippingAddress.houseNumber}${data.shippingAddress.addition || ''}<br>
        ${data.shippingAddress.postalCode} ${data.shippingAddress.city}<br>
        ${data.shippingAddress.country}
      </div>
      
      <h2 class="section-title">Wat gebeurt er nu?</h2>
      <ol style="line-height: 2;">
        <li><strong>Verwerking:</strong> We pakken je bestelling in en maken deze verzendklaar</li>
        <li><strong>Verzending:</strong> Je ontvangt een track & trace code zodra je pakket onderweg is</li>
        <li><strong>Levering:</strong> Morgen al in huis</li>
      </ol>
      
      <p style="text-align: center; margin-top: 40px;">
        <a href="${env.FRONTEND_URL}/orders/${data.orderId}" class="button">Bekijk Bestelling</a>
      </p>
      
      <p style="margin-top: 40px; color: #6b7280; font-size: 14px; text-align: center;">
        Vragen over je bestelling? Wij helpen je graag!
      </p>
    </div>
    
    <div class="footer">
      <p>Email: info@catsupply.nl | Telefoon: +31 20 123 4567</p>
      <p>&copy; ${new Date().getFullYear()} CatSupply - Premium Automatische Kattenbakken</p>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
Bedankt voor je bestelling!

Beste ${data.customerName},

We hebben je bestelling ontvangen en gaan deze zo snel mogelijk verwerken.

BESTELNUMMER: ${data.orderNumber}

BESTELOVERZICHT:
${data.items.map(item => `- ${item.name} (${item.quantity}x) - €${item.price.toFixed(2)}`).join('\n')}

Subtotaal: €${data.subtotal.toFixed(2)}
Verzendkosten: GRATIS
BTW (21%): €${data.tax.toFixed(2)}
TOTAAL: €${data.total.toFixed(2)}

VERZENDADRES:
${data.shippingAddress.street} ${data.shippingAddress.houseNumber}${data.shippingAddress.addition || ''}
${data.shippingAddress.postalCode} ${data.shippingAddress.city}
${data.shippingAddress.country}

WAT GEBEURT ER NU?
1. We pakken je bestelling in en maken deze verzendklaar
2. Je ontvangt een track & trace code zodra je pakket onderweg is
3. Morgen al in huis

Bekijk je bestelling: ${env.FRONTEND_URL}/orders/${data.orderId}

Vragen? Neem contact op via info@catsupply.nl

Met vriendelijke groet,
Team CatSupply
    `;

    await this.send({
      to: data.customerEmail,
      subject: `Bestelling Bevestigd - ${data.orderNumber}`,
      html,
      text,
    });
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
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 100%; margin: 0; padding: 0; }
    .header { background: #10b981; color: white; padding: 40px 20px; text-align: center; }
    .content { background: #ffffff; padding: 40px 20px; }
    .button { display: inline-block; background: #10b981; color: white; padding: 16px 40px; 
              text-decoration: none; margin: 20px 0; font-weight: bold; font-size: 16px; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; padding: 30px 20px; background: #f9fafb; }
    .info-box { background: #f9fafb; padding: 20px; border-left: 4px solid #10b981; margin: 30px 0; }
    .section-title { color: #1f2937; margin-top: 40px; font-size: 22px; border-bottom: 2px solid #10b981; padding-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Uw Retourlabel is Klaar</h1>
    </div>
    
    <div class="content">
      <p>Beste ${data.customerName},</p>
      
      <p>Uw retourlabel voor bestelling <strong>${data.orderNumber}</strong> is gegenereerd en staat klaar.</p>
      
      <div class="info-box">
        <strong>Tracking Code:</strong> ${data.trackingCode}<br>
        <strong>Track & Trace:</strong> <a href="${data.trackingUrl}">${data.trackingUrl}</a>
      </div>
      
      <h2 class="section-title">Hoe werkt het?</h2>
      <ol style="line-height: 2;">
        <li><strong>Print</strong> het retourlabel (zie bijlage)</li>
        <li><strong>Plak</strong> het label op uw pakket</li>
        <li><strong>Breng</strong> het pakket naar een PostNL punt</li>
        <li><strong>Klaar!</strong> Wij verwerken uw retour binnen 5 werkdagen</li>
      </ol>
      
      <p style="margin-top: 40px; text-align: center;">
        <a href="${data.trackingUrl}" class="button">Volg Uw Retour</a>
      </p>
      
      <p style="margin-top: 40px; color: #6b7280; font-size: 14px;">
        <strong>Tip:</strong> Bewaar het retourlabel ook digitaal als backup.
      </p>
    </div>
    
    <div class="footer">
      <p>Vragen? Neem contact op via retour@catsupply.nl</p>
      <p>&copy; ${new Date().getFullYear()} CatSupply - Automatische Kattenbakken</p>
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

Vragen? retour@catsupply.nl

Met vriendelijke groet,
Team CatSupply
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
      subject: `Retourlabel Klaar - Bestelling ${data.orderNumber}`,
      html,
      text,
      attachments,
    });
  }
}




import PDFDocument from 'pdfkit';
import { env } from '@/config/env.config';
import { logger } from '@/config/logger.config';

/**
 * PDF GENERATOR SERVICE - DRY & Dynamic
 * Generates A4 PDF documents (return instructions, invoices, etc.)
 */

export interface ReturnInstructionsData {
  customerName: string;
  orderNumber: string;
  orderDate: string;
  returnDeadline: string;
  trackingCode: string;
  returnAddress: {
    company: string;
    street: string;
    number: string;
    postalCode: string;
    city: string;
    country: string;
  };
}

export class PDFGeneratorService {
  /**
   * Generate return instructions PDF (A4 format)
   * DRY: Template-based with dynamic data
   */
  static async generateReturnInstructions(data: ReturnInstructionsData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        logger.info(`Generating return instructions PDF for order ${data.orderNumber}`);

        // Create PDF document (A4 size)
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50,
          },
        });

        const chunks: Buffer[] = [];

        // Collect PDF data
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          logger.info(`Return instructions PDF generated (${pdfBuffer.length} bytes)`);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // HEADER
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        doc
          .fillColor('#10b981')
          .fontSize(28)
          .text('Retour Instructies', { align: 'center' })
          .moveDown(0.5);

        doc
          .fillColor('#6b7280')
          .fontSize(12)
          .text('Kattenbak B.V. - Automatische Kattenbakken', { align: 'center' })
          .moveDown(2);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ORDER INFO BOX
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        doc
          .fillColor('#000000')
          .fontSize(14)
          .text('Bestelling Informatie', { underline: true })
          .moveDown(0.5);

        const infoY = doc.y;
        doc
          .fontSize(11)
          .fillColor('#374151')
          .text(`Klantnaam:`, 72, infoY)
          .text(`Bestelnummer:`, 72, infoY + 20)
          .text(`Besteldatum:`, 72, infoY + 40)
          .text(`Retour Deadline:`, 72, infoY + 60)
          .text(`Tracking Code:`, 72, infoY + 80);

        doc
          .fontSize(11)
          .fillColor('#000000')
          .text(data.customerName, 220, infoY, { width: 300 })
          .text(data.orderNumber, 220, infoY + 20)
          .text(data.orderDate, 220, infoY + 40)
          .text(data.returnDeadline, 220, infoY + 60)
          .text(data.trackingCode, 220, infoY + 80);

        doc.moveDown(3);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // RETURN STEPS
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        doc
          .fillColor('#10b981')
          .fontSize(16)
          .text('🔄 Hoe Werkt Het?', { underline: true })
          .moveDown(1);

        const steps = [
          {
            number: '1',
            title: 'Print het retourlabel',
            description: 'Print het bijgevoegde retourlabel. Dit kan ook op gewoon A4 papier.',
          },
          {
            number: '2',
            title: 'Verpak uw product',
            description: 'Verpak het product goed in de originele verpakking. Zorg dat het product compleet is.',
          },
          {
            number: '3',
            title: 'Plak het label op het pakket',
            description: 'Plak het retourlabel duidelijk zichtbaar op de buitenkant van het pakket.',
          },
          {
            number: '4',
            title: 'Breng het pakket naar PostNL',
            description: 'Breng het pakket naar een PostNL punt of postpunt bij u in de buurt.',
          },
          {
            number: '5',
            title: 'Klaar!',
            description: 'Wij verwerken uw retour binnen 5 werkdagen na ontvangst.',
          },
        ];

        steps.forEach((step) => {
          const stepY = doc.y;

          // Step number circle
          doc
            .circle(85, stepY + 8, 12)
            .fillColor('#10b981')
            .fill()
            .fillColor('#ffffff')
            .fontSize(12)
            .text(step.number, 79, stepY + 3, { width: 12, align: 'center' });

          // Step content
          doc
            .fillColor('#000000')
            .fontSize(12)
            .text(step.title, 110, stepY, { continued: false })
            .moveDown(0.3)
            .fillColor('#6b7280')
            .fontSize(10)
            .text(step.description, 110, doc.y, { width: 420 })
            .moveDown(1);
        });

        doc.moveDown(1);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // RETURN ADDRESS BOX
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        doc
          .fillColor('#10b981')
          .fontSize(14)
          .text('📍 Retouradres', { underline: true })
          .moveDown(0.5);

        doc
          .fillColor('#374151')
          .fontSize(11)
          .text(data.returnAddress.company)
          .text(`${data.returnAddress.street} ${data.returnAddress.number}`)
          .text(`${data.returnAddress.postalCode} ${data.returnAddress.city}`)
          .text(data.returnAddress.country)
          .moveDown(2);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // IMPORTANT NOTES
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        doc
          .fillColor('#ef4444')
          .fontSize(14)
          .text('⚠️  Belangrijk', { underline: true })
          .moveDown(0.5);

        const notes = [
          'Het product moet compleet en in originele staat zijn',
          'Retourzendingen zonder retourlabel worden niet geaccepteerd',
          'De retourperiode is 14 dagen na levering',
          'Kosten van retourzending zijn voor uw rekening',
          'Terugbetaling volgt binnen 14 dagen na ontvangst',
        ];

        doc.fillColor('#6b7280').fontSize(10);
        notes.forEach((note) => {
          doc.text(`• ${note}`, { indent: 10 }).moveDown(0.3);
        });

        doc.moveDown(2);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // FOOTER
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const footerY = 750;
        doc
          .moveTo(72, footerY)
          .lineTo(540, footerY)
          .strokeColor('#e5e7eb')
          .stroke();

        doc
          .fillColor('#9ca3af')
          .fontSize(9)
          .text(
            'Vragen? Neem contact op via retour@kattenbak.nl of bel +31 20 123 4567',
            72,
            footerY + 10,
            { align: 'center', width: 468 }
          )
          .text(
            `© ${new Date().getFullYear()} Kattenbak B.V. - KvK: 12345678 - BTW: NL123456789B01`,
            { align: 'center' }
          );

        // Finalize PDF
        doc.end();
      } catch (error: any) {
        logger.error('PDF generation failed:', error);
        reject(error);
      }
    });
  }
}


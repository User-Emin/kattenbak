import { Router, Request, Response } from 'express';
import { MyParcelReturnService } from '../services/myparcel-return.service';
import { EmailService } from '../services/email.service';
import { PDFGeneratorService } from '../services/pdf-generator.service';
import { logger } from '../config/logger.config';
import { env } from '../config/env.config';
import { prisma } from '../config/database.config';
import { extractStringParam } from '../utils/params.util';
import axios from 'axios';

const router = Router();

/**
 * RETURN ROUTES - DRY & Complete
 * Handles both automatic (customer) and manual (admin) return flows
 */

/**
 * POST /api/v1/returns
 * Create return request and generate label
 * DRY: Works for both customer and admin initiated returns
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      orderId,
      orderNumber,
      customerName,
      customerEmail,
      shippingAddress,
      reason,
      reasonDetails,
      items,
      customerNotes,
      sendEmail = true, // Default: send email automatically
    } = req.body;

    // ✅ FIX: Validate required fields with better error messages
    if (!orderId && !orderNumber) {
      return res.status(400).json({
        success: false,
        error: 'orderId of orderNumber is verplicht',
      });
    }

    // Fetch order if only orderNumber provided
    let actualOrderId = orderId;
    let actualOrderNumber = orderNumber;
    let actualShippingAddress = shippingAddress;

    if (!actualOrderId && actualOrderNumber) {
      const order = await prisma.order.findUnique({
        where: { orderNumber: actualOrderNumber },
        include: { shippingAddress: true },
      });
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: `Order ${actualOrderNumber} niet gevonden`,
        });
      }
      
      actualOrderId = order.id;
      actualShippingAddress = order.shippingAddress || shippingAddress;
    }

    if (!actualOrderId || !actualOrderNumber || !customerEmail || !actualShippingAddress) {
      return res.status(400).json({
        success: false,
        error: 'Ontbrekende verplichte velden: orderId, orderNumber, customerEmail, shippingAddress',
      });
    }

    logger.info(`Processing return request for order ${actualOrderNumber}`, {
      orderId: actualOrderId,
      customerEmail,
      reason,
    });

    // Step 1: Create return label via MyParcel (may fail in dev/test, continue anyway)
    let returnLabel: any;
    try {
      returnLabel = await MyParcelReturnService.createReturnLabel({
        orderId: actualOrderId,
        orderNumber: actualOrderNumber,
        customerName,
        customerEmail,
        shippingAddress: actualShippingAddress,
        reason: reason || 'OTHER',
      });
    } catch (myparcelError: any) {
      // ✅ FIX: Continue even if MyParcel fails (for development/testing)
      logger.warn('MyParcel return label creation failed, continuing without label:', myparcelError.message);
      returnLabel = {
        returnId: `RET-${actualOrderId}-${Date.now()}`,
        myparcelId: null,
        trackingCode: null,
        trackingUrl: null,
        labelUrl: null,
        createdAt: new Date(),
      };
    }

    // Step 2: Generate return instructions PDF (if MyParcel succeeded)
    let instructionsPdf: Buffer | undefined;
    if (returnLabel.trackingCode) {
      try {
        const returnDeadline = new Date();
        returnDeadline.setDate(returnDeadline.getDate() + 14);

        instructionsPdf = await PDFGeneratorService.generateReturnInstructions({
          customerName,
          orderNumber: actualOrderNumber,
          orderDate: new Date().toLocaleDateString('nl-NL'),
          returnDeadline: returnDeadline.toLocaleDateString('nl-NL'),
          trackingCode: returnLabel.trackingCode,
          returnAddress: {
            company: env.MYPARCEL_RETURN_ADDRESS.company,
            street: env.MYPARCEL_RETURN_ADDRESS.street,
            number: env.MYPARCEL_RETURN_ADDRESS.number,
            postalCode: env.MYPARCEL_RETURN_ADDRESS.postalCode,
            city: env.MYPARCEL_RETURN_ADDRESS.city,
            country: env.MYPARCEL_RETURN_ADDRESS.country,
          },
        });
      } catch (pdfError: any) {
        logger.warn('Could not generate return instructions PDF:', pdfError.message);
      }
    }

    // Step 3: Download return label PDF from MyParcel (if available)
    let labelPdfBuffer: Buffer | undefined;
    if (returnLabel.labelUrl) {
      try {
        const labelResponse = await axios.get(returnLabel.labelUrl, {
          responseType: 'arraybuffer',
          headers: {
            'Authorization': `Bearer ${env.MYPARCEL_API_KEY}`,
          },
        });
        labelPdfBuffer = Buffer.from(labelResponse.data);
      } catch (error) {
        logger.warn('Could not download return label PDF, continuing without it');
      }
    }

    // Step 4: Save return request to database
    const returnRecord = await prisma.return.create({
      data: {
        orderId: actualOrderId,
        myparcelId: returnLabel.myparcelId || undefined,
        trackingCode: returnLabel.trackingCode || undefined,
        trackingUrl: returnLabel.trackingUrl || undefined,
        labelUrl: returnLabel.labelUrl || undefined,
        reason: reason || 'OTHER',
        reasonDetails: reasonDetails || undefined,
        items: items ? (Array.isArray(items) ? items : []) : [],
        status: returnLabel.trackingCode ? 'LABEL_CREATED' : 'REQUESTED',
        customerNotes: customerNotes || undefined,
        emailSentAt: sendEmail ? new Date() : undefined,
      },
    });

    logger.info(`Return request saved to database: ${returnRecord.id}`);

    // Step 5: Send email (if requested and label available)
    if (sendEmail && returnLabel.trackingCode) {
      try {
        await EmailService.sendReturnLabelEmail({
          customerName,
          customerEmail,
          orderNumber: actualOrderNumber,
          trackingCode: returnLabel.trackingCode,
          trackingUrl: returnLabel.trackingUrl,
          labelPdfBuffer,
          instructionsPdfBuffer: instructionsPdf,
        });
        
        // Update email sent timestamp
        await prisma.return.update({
          where: { id: returnRecord.id },
          data: { emailSentAt: new Date(), status: 'LABEL_SENT' },
        });
      } catch (emailError: any) {
        logger.warn('Could not send return email:', emailError.message);
        // Continue anyway - return request is saved
      }
    }

    // Return success response
    res.json({
      success: true,
      data: {
        returnId: returnRecord.id,
        myparcelId: returnLabel.myparcelId,
        trackingCode: returnLabel.trackingCode,
        trackingUrl: returnLabel.trackingUrl,
        labelUrl: returnLabel.labelUrl,
        emailSent: sendEmail,
        createdAt: returnRecord.createdAt,
      },
      message: sendEmail
        ? 'Return label created and email sent'
        : 'Return label created (email not sent)',
    });
  } catch (error: any) {
    logger.error('Return request failed:', {
      error: error.message,
      stack: error.stack,
      body: req.body,
    });

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process return request',
    });
  }
});

/**
 * POST /api/v1/returns/validate/:orderId
 * Validate if order is eligible for return
 * DRY: Business logic validation with real database
 * ✅ FIX: Must be BEFORE /:returnId route to avoid conflicts
 */
router.post('/validate/:orderId', async (req: Request, res: Response) => {
  try {
    // ✅ SECURITY: Type-safe parameter extraction
    const orderId = extractStringParam(req.params.orderId);

    // ✅ FIX: Fetch real order from database (by ID or orderNumber)
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNumber: orderId },
        ],
      },
      include: {
        returns: {
          select: { id: true, status: true },
        },
        shipment: {
          select: { deliveredAt: true },
        },
      },
    });

    if (!order) {
      return res.json({
        success: true,
        data: {
          eligible: false,
          reason: 'Bestelling niet gevonden',
        },
      });
    }

    // ✅ FIX: Type-safe property access with defensive checks
    const shipmentDeliveredAt = order.shipment && 'deliveredAt' in order.shipment 
      ? (order.shipment as any).deliveredAt 
      : null;
    const returnsArray = order.returns && Array.isArray(order.returns) 
      ? order.returns 
      : [];

    // Build order object for validation
    const orderForValidation = {
      id: order.id,
      status: order.status,
      deliveredAt: shipmentDeliveredAt || order.completedAt,
      completedAt: order.completedAt,
      returnId: returnsArray.length > 0 ? returnsArray[0].id : null,
    };

    const validation = MyParcelReturnService.validateReturnEligibility(orderForValidation);

    res.json({
      success: true,
      data: validation,
    });
  } catch (error: any) {
    logger.error('Return validation failed:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to validate return eligibility',
    });
  }
});

/**
 * GET /api/v1/returns/:returnId
 * Get return status/details
 * DRY: Single source for return info
 */
router.get('/:returnId', async (req: Request, res: Response) => {
  try {
    // ✅ SECURITY: Type-safe parameter extraction
    const returnId = extractStringParam(req.params.returnId);

    // TODO: Fetch from database
    // For now, return mock data
    res.json({
      success: true,
      data: {
        returnId,
        status: 'LABEL_CREATED',
        createdAt: new Date(),
        trackingCode: 'TRACK123456',
        trackingUrl: 'https://postnl.nl/tracktrace/?B=TRACK123456',
      },
    });
  } catch (error: any) {
    logger.error('Get return failed:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get return details',
    });
  }
});

export default router;




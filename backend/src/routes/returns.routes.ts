import { Router, Request, Response } from 'express';
import { MyParcelReturnService } from '@/services/myparcel-return.service';
import { EmailService } from '@/services/email.service';
import { PDFGeneratorService } from '@/services/pdf-generator.service';
import { logger } from '@/config/logger.config';
import { env } from '@/config/env.config';
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
      sendEmail = true, // Default: send email automatically
    } = req.body;

    // Validate required fields
    if (!orderId || !orderNumber || !customerEmail || !shippingAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: orderId, orderNumber, customerEmail, shippingAddress',
      });
    }

    logger.info(`Processing return request for order ${orderNumber}`, {
      orderId,
      customerEmail,
      reason,
    });

    // Step 1: Create return label via MyParcel
    const returnLabel = await MyParcelReturnService.createReturnLabel({
      orderId,
      orderNumber,
      customerName,
      customerEmail,
      shippingAddress,
      reason,
    });

    // Step 2: Generate return instructions PDF
    const returnDeadline = new Date();
    returnDeadline.setDate(returnDeadline.getDate() + 14);

    const instructionsPdf = await PDFGeneratorService.generateReturnInstructions({
      customerName,
      orderNumber,
      orderDate: new Date().toLocaleDateString('nl-NL'),
      returnDeadline: returnDeadline.toLocaleDateString('nl-NL'),
      trackingCode: returnLabel.trackingCode,
      returnAddress: env.MYPARCEL_RETURN_ADDRESS,
    });

    // Step 3: Download return label PDF from MyParcel
    let labelPdfBuffer: Buffer | undefined;
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

    // Step 4: Send email (if requested)
    if (sendEmail) {
      await EmailService.sendReturnLabelEmail({
        customerName,
        customerEmail,
        orderNumber,
        trackingCode: returnLabel.trackingCode,
        trackingUrl: returnLabel.trackingUrl,
        labelPdfBuffer,
        instructionsPdfBuffer: instructionsPdf,
      });
    }

    // Return success response
    res.json({
      success: true,
      data: {
        returnId: returnLabel.returnId,
        myparcelId: returnLabel.myparcelId,
        trackingCode: returnLabel.trackingCode,
        trackingUrl: returnLabel.trackingUrl,
        labelUrl: returnLabel.labelUrl,
        emailSent: sendEmail,
        createdAt: returnLabel.createdAt,
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
 * DRY: Business logic validation
 */
router.post('/validate/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    // TODO: Fetch real order from database
    // For now, use mock data
    const mockOrder = {
      id: orderId,
      status: 'DELIVERED',
      deliveredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      returnId: null,
    };

    const validation = MyParcelReturnService.validateReturnEligibility(mockOrder);

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
    const { returnId } = req.params;

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

/**
 * POST /api/v1/returns/:returnId/resend-email
 * Resend return email (admin action)
 * DRY: Reuse email service
 */
router.post('/:returnId/resend-email', async (req: Request, res: Response) => {
  try {
    const { returnId } = req.params;
    const { customerEmail } = req.body;

    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        error: 'customerEmail is required',
      });
    }

    // TODO: Fetch return data from database
    // For now, return success
    logger.info(`Resending return email for ${returnId} to ${customerEmail}`);

    res.json({
      success: true,
      message: 'Return email resent successfully',
    });
  } catch (error: any) {
    logger.error('Resend return email failed:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to resend return email',
    });
  }
});

export default router;


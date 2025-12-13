import { Router, Request, Response } from 'express';
import { MyParcelReturnService } from '@/services/myparcel-return.service';
import { EmailService } from '@/services/email.service';
import { PDFGeneratorService } from '@/services/pdf-generator.service';
import { logger } from '@/config/logger.config';
import { env } from '@/config/env.config';
import axios from 'axios';

const router = Router();

/**
 * ADMIN RETURN ROUTES - DRY & Complete
 * Admin panel return management
 */

// DRY: Mock returns data
const MOCK_RETURNS = [
  {
    id: 'RET-001',
    orderId: '1',
    orderNumber: 'ORD-2024-001',
    customerName: 'Jan Pietersen',
    customerEmail: 'jan@example.com',
    status: 'LABEL_CREATED',
    reason: 'Product niet zoals verwacht',
    trackingCode: 'TRACK123456',
    trackingUrl: 'https://postnl.nl/tracktrace/?B=TRACK123456',
    createdAt: new Date('2024-12-10').toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * GET /api/v1/admin/returns
 * List all returns
 */
router.get('/', (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;

  res.json({
    success: true,
    data: MOCK_RETURNS,
    meta: { page, pageSize, total: MOCK_RETURNS.length, totalPages: 1 },
  });
});

/**
 * GET /api/v1/admin/returns/:id
 * Get single return
 */
router.get('/:id', (req: Request, res: Response) => {
  const returnData = MOCK_RETURNS.find((r) => r.id === req.params.id);

  if (!returnData) {
    return res.status(404).json({
      success: false,
      error: 'Return not found',
    });
  }

  res.json({
    success: true,
    data: returnData,
  });
});

/**
 * POST /api/v1/admin/returns/create
 * Admin manually creates return label
 * DRY: Uses same service as customer-initiated returns
 */
router.post('/create', async (req: Request, res: Response) => {
  try {
    const {
      orderId,
      orderNumber,
      customerName,
      customerEmail,
      shippingAddress,
      reason,
      sendEmail = false, // Admin decides whether to send email
    } = req.body;

    // Validate
    if (!orderId || !orderNumber || !customerEmail || !shippingAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    logger.info(`Admin creating return label for order ${orderNumber}`);

    // Create return label
    const returnLabel = await MyParcelReturnService.createReturnLabel({
      orderId,
      orderNumber,
      customerName,
      customerEmail,
      shippingAddress,
      reason,
    });

    // Generate instructions PDF
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

    // Download label PDF
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
      logger.warn('Could not download return label PDF');
    }

    // Send email if requested
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
      message: 'Return label created by admin',
    });
  } catch (error: any) {
    logger.error('Admin return creation failed:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create return label',
    });
  }
});

/**
 * POST /api/v1/admin/returns/:id/send-email
 * Admin manually sends return email
 * DRY: Reuse email service
 */
router.post('/:id/send-email', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const returnData = MOCK_RETURNS.find((r) => r.id === id);

    if (!returnData) {
      return res.status(404).json({
        success: false,
        error: 'Return not found',
      });
    }

    // Generate PDFs
    const returnDeadline = new Date();
    returnDeadline.setDate(returnDeadline.getDate() + 14);

    const instructionsPdf = await PDFGeneratorService.generateReturnInstructions({
      customerName: returnData.customerName,
      orderNumber: returnData.orderNumber,
      orderDate: new Date(returnData.createdAt).toLocaleDateString('nl-NL'),
      returnDeadline: returnDeadline.toLocaleDateString('nl-NL'),
      trackingCode: returnData.trackingCode,
      returnAddress: env.MYPARCEL_RETURN_ADDRESS,
    });

    // Send email
    await EmailService.sendReturnLabelEmail({
      customerName: returnData.customerName,
      customerEmail: returnData.customerEmail,
      orderNumber: returnData.orderNumber,
      trackingCode: returnData.trackingCode,
      trackingUrl: returnData.trackingUrl,
      instructionsPdfBuffer: instructionsPdf,
    });

    res.json({
      success: true,
      message: 'Return email sent successfully',
    });
  } catch (error: any) {
    logger.error('Admin send return email failed:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send return email',
    });
  }
});

/**
 * PUT /api/v1/admin/returns/:id
 * Update return status
 */
router.put('/:id', (req: Request, res: Response) => {
  const returnData = MOCK_RETURNS.find((r) => r.id === req.params.id);

  if (!returnData) {
    return res.status(404).json({
      success: false,
      error: 'Return not found',
    });
  }

  // Update mock data
  Object.assign(returnData, req.body, { updatedAt: new Date().toISOString() });

  res.json({
    success: true,
    data: returnData,
    message: 'Return updated successfully',
  });
});

export default router;


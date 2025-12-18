import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@/config/database';
import { successResponse, errorResponse } from '@/utils/response.util';
import { logger } from '@/config/logger';
import { MyParcelService } from '@/services/myparcel.service';
import { sendReturnLabelEmail } from '@/services/email.service';

const router = Router();

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ADMIN ENDPOINTS - Return Management
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

/**
 * Get all returns
 * GET /api/v1/admin/returns
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const returns = await prisma.return.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          include: {
            shippingAddress: true,
          },
        },
      },
      take: 100,
    });

    const formattedReturns = returns.map(r => ({
      id: r.id,
      orderId: r.orderId,
      orderNumber: r.order.orderNumber,
      customerEmail: r.order.customerEmail,
      customerName: r.order.shippingAddress 
        ? `${r.order.shippingAddress.firstName} ${r.order.shippingAddress.lastName}`
        : 'Gast',
      myparcelId: r.myparcelId,
      trackingCode: r.trackingCode,
      reason: r.reason,
      reasonDetails: r.reasonDetails,
      status: r.status,
      items: JSON.parse(r.items as string),
      refundAmount: r.refundAmount?.toNumber(),
      customerNotes: r.customerNotes,
      adminNotes: r.adminNotes,
      emailSentAt: r.emailSentAt,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      receivedAt: r.receivedAt,
      refundedAt: r.refundedAt,
      closedAt: r.closedAt,
    }));

    res.json(successResponse(formattedReturns));
  } catch (error: any) {
    logger.error('Admin get returns error:', error);
    next(error);
  }
});

/**
 * Get single return
 * GET /api/v1/admin/returns/:id
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const returnRecord = await prisma.return.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            shippingAddress: true,
            billingAddress: true,
            items: {
              include: {
                product: true,
              },
            },
            payment: true,
          },
        },
      },
    });

    if (!returnRecord) {
      return res.status(404).json(errorResponse('Retour niet gevonden'));
    }

    // Get tracking info if available
    let trackingInfo = null;
    if (returnRecord.myparcelId) {
      try {
        trackingInfo = await MyParcelService.trackReturnShipment(returnRecord.myparcelId);
      } catch (error) {
        logger.error('Tracking info fetch failed:', error);
      }
    }

    res.json(successResponse({
      id: returnRecord.id,
      orderId: returnRecord.orderId,
      order: {
        orderNumber: returnRecord.order.orderNumber,
        customerEmail: returnRecord.order.customerEmail,
        customerPhone: returnRecord.order.customerPhone,
        total: returnRecord.order.total.toNumber(),
        createdAt: returnRecord.order.createdAt,
        shippingAddress: returnRecord.order.shippingAddress,
        billingAddress: returnRecord.order.billingAddress,
        items: returnRecord.order.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          productImage: item.product.images ? (JSON.parse(item.product.images as string)[0] || null) : null,
          quantity: item.quantity,
          price: item.price.toNumber(),
        })),
      },
      myparcelId: returnRecord.myparcelId,
      trackingCode: returnRecord.trackingCode,
      trackingUrl: returnRecord.trackingUrl,
      labelUrl: returnRecord.labelUrl,
      reason: returnRecord.reason,
      reasonDetails: returnRecord.reasonDetails,
      status: returnRecord.status,
      items: JSON.parse(returnRecord.items as string),
      refundAmount: returnRecord.refundAmount?.toNumber(),
      customerNotes: returnRecord.customerNotes,
      adminNotes: returnRecord.adminNotes,
      customerPhotos: returnRecord.customerPhotos ? JSON.parse(returnRecord.customerPhotos as string) : [],
      emailSentAt: returnRecord.emailSentAt,
      createdAt: returnRecord.createdAt,
      updatedAt: returnRecord.updatedAt,
      receivedAt: returnRecord.receivedAt,
      refundedAt: returnRecord.refundedAt,
      closedAt: returnRecord.closedAt,
      tracking: trackingInfo,
    }));
  } catch (error: any) {
    logger.error('Admin get return error:', error);
    next(error);
  }
});

/**
 * Update return status
 * PUT /api/v1/admin/returns/:id/status
 */
router.put('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    // Set timestamps based on status
    if (status === 'RECEIVED') {
      updateData.receivedAt = new Date();
    } else if (status === 'REFUND_PROCESSED') {
      updateData.refundedAt = new Date();
    } else if (status === 'CLOSED') {
      updateData.closedAt = new Date();
    }

    const returnRecord = await prisma.return.update({
      where: { id },
      data: updateData,
    });

    logger.info(`✅ Return ${id} status updated to ${status}`);

    res.json(successResponse({
      message: 'Retour status bijgewerkt',
      return: returnRecord,
    }));
  } catch (error: any) {
    logger.error('Admin update return status error:', error);
    next(error);
  }
});

/**
 * Create return label manually (if automatic failed)
 * POST /api/v1/admin/returns/:id/create-label
 */
router.post('/:id/create-label', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { sendEmail = true } = req.body;

    const returnRecord = await prisma.return.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            shippingAddress: true,
          },
        },
      },
    });

    if (!returnRecord) {
      return res.status(404).json(errorResponse('Retour niet gevonden'));
    }

    // Create MyParcel return shipment
    const myparcelResult = await MyParcelService.createReturnShipment(id);

    // Send email if requested
    if (sendEmail && returnRecord.order.shippingAddress) {
      const address = returnRecord.order.shippingAddress;
      await sendReturnLabelEmail({
        to: returnRecord.order.customerEmail,
        customerName: `${address.firstName} ${address.lastName}`,
        orderNumber: returnRecord.order.orderNumber,
        returnId: id,
        labelUrl: myparcelResult.labelUrl,
        trackingCode: myparcelResult.trackingCode,
        trackingUrl: myparcelResult.trackingUrl,
      });

      await prisma.return.update({
        where: { id },
        data: {
          emailSentAt: new Date(),
          status: 'LABEL_SENT',
        },
      });
    }

    logger.info(`✅ Return label manually created for return ${id}`);

    res.json(successResponse({
      message: 'Retourlabel succesvol aangemaakt',
      ...myparcelResult,
    }));
  } catch (error: any) {
    logger.error('Admin create return label error:', error);
    next(error);
  }
});

/**
 * Resend return label email
 * POST /api/v1/admin/returns/:id/resend-email
 */
router.post('/:id/resend-email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const returnRecord = await prisma.return.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            shippingAddress: true,
          },
        },
      },
    });

    if (!returnRecord) {
      return res.status(404).json(errorResponse('Retour niet gevonden'));
    }

    if (!returnRecord.labelUrl) {
      return res.status(400).json(errorResponse('Geen retourlabel beschikbaar'));
    }

    const address = returnRecord.order.shippingAddress;
    if (!address) {
      return res.status(400).json(errorResponse('Geen verzendadres beschikbaar'));
    }

    await sendReturnLabelEmail({
      to: returnRecord.order.customerEmail,
      customerName: `${address.firstName} ${address.lastName}`,
      orderNumber: returnRecord.order.orderNumber,
      returnId: id,
      labelUrl: returnRecord.labelUrl,
      trackingCode: returnRecord.trackingCode || '',
      trackingUrl: returnRecord.trackingUrl || '',
    });

    await prisma.return.update({
      where: { id },
      data: {
        emailSentAt: new Date(),
      },
    });

    logger.info(`✅ Return label email resent for return ${id}`);

    res.json(successResponse({
      message: 'Email opnieuw verzonden',
    }));
  } catch (error: any) {
    logger.error('Admin resend return email error:', error);
    next(error);
  }
});

export default router;


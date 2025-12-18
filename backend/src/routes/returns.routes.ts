import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@/config/database';
import { successResponse, errorResponse } from '@/utils/response.util';
import { logger } from '@/config/logger';

const router = Router();

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * PUBLIC ENDPOINTS - Returns
 * DRY & Secure: proper error handling + validation
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

/**
 * Check if order is eligible for return
 * GET /api/v1/returns/check/:orderNumber
 */
router.get('/check/:orderNumber', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderNumber } = req.params;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        returns: true,
      },
    });

    if (!order) {
      return res.status(404).json(errorResponse('Order niet gevonden'));
    }

    // Check if order was created within 30 days
    const daysSinceOrder = Math.floor((Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const isWithinReturnPeriod = daysSinceOrder <= 30;

    // Check if already has active return
    const hasActiveReturn = order.returns.some(r => !['CLOSED', 'REJECTED'].includes(r.status));

    const eligible = isWithinReturnPeriod && !hasActiveReturn && order.status !== 'CANCELLED';

    res.json(successResponse({
      eligible,
      reason: !eligible 
        ? (!isWithinReturnPeriod ? 'Retourperiode (30 dagen) is verlopen' : 'Er is al een actieve retour voor deze bestelling')
        : undefined,
      returnDeadline: new Date(order.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        items: order.items.map(item => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          productImage: item.product.images ? (JSON.parse(item.product.images as string)[0] || null) : null,
          quantity: item.quantity,
          price: item.price.toNumber(),
        })),
      },
    }));
  } catch (error: any) {
    logger.error('Return eligibility check error:', error);
    next(error);
  }
});

/**
 * Create return request
 * POST /api/v1/returns
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      orderId,
      orderNumber,
      customerName,
      customerEmail,
      reason,
      reasonDetails,
      items,
      customerNotes,
      customerPhotos,
      sendEmail = true,
    } = req.body;

    // Validate required fields
    if (!orderId || !customerEmail || !reason || !items || items.length === 0) {
      return res.status(400).json(errorResponse('Verplichte velden ontbreken'));
    }

    // Validate order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        shippingAddress: true,
        items: true,
      },
    });

    if (!order) {
      return res.status(404).json(errorResponse('Order niet gevonden'));
    }

    // Check return period (30 days)
    const daysSinceOrder = Math.floor((Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceOrder > 30) {
      return res.status(400).json(errorResponse('Retourperiode (30 dagen) is verlopen'));
    }

    // Calculate refund amount
    const refundAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    // Create return record
    const returnRecord = await prisma.return.create({
      data: {
        orderId,
        reason,
        reasonDetails: reasonDetails || null,
        status: 'REQUESTED',
        items: JSON.stringify(items),
        refundAmount,
        customerNotes: customerNotes || null,
        customerPhotos: customerPhotos ? JSON.stringify(customerPhotos) : null,
      },
    });

    logger.info(`✅ Return created: ${returnRecord.id} for order ${orderNumber}`);

    // Simplified response - no MyParcel/email for now (admin handles manually)
    res.status(201).json(successResponse({
      message: 'Retour aanvraag succesvol aangemaakt',
      return: {
        returnId: returnRecord.id,
        status: returnRecord.status,
        refundAmount: returnRecord.refundAmount.toNumber(),
        createdAt: returnRecord.createdAt,
      },
    }));
  } catch (error: any) {
    logger.error('Return creation error:', error);
    next(error);
  }
});

/**
 * Get return status
 * GET /api/v1/returns/:id
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
          },
        },
      },
    });

    if (!returnRecord) {
      return res.status(404).json(errorResponse('Retour niet gevonden'));
    }

    res.json(successResponse({
      return: {
        id: returnRecord.id,
        orderId: returnRecord.orderId,
        orderNumber: returnRecord.order.orderNumber,
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
        emailSentAt: returnRecord.emailSentAt,
        createdAt: returnRecord.createdAt,
        updatedAt: returnRecord.updatedAt,
      },
    }));
  } catch (error: any) {
    logger.error('Return fetch error:', error);
    next(error);
  }
});

export default router;


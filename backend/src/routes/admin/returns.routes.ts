import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, adminMiddleware, rateLimitMiddleware } from '../../middleware/auth.middleware';
import { transformOrder } from '../../lib/transformers';
import { MollieService } from '../../services/mollie.service';
import { logger } from '../../config/logger.config';

const router = Router();
const prisma = new PrismaClient();

// Security: Auth + Admin required
router.use(authMiddleware);
router.use(adminMiddleware);
router.use(rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 100 }));

/**
 * GET /api/v1/admin/returns
 * Get all returns
 */
router.get('/', async (req, res) => {
  try {
    const { status, page = '1', pageSize = '20' } = req.query;
    
    const skip = (parseInt(page as string) - 1) * parseInt(pageSize as string);
    
    const where: any = {};
    if (status) where.status = status;
    
    const [returns, total] = await Promise.all([
      prisma.return.findMany({
        where,
        skip,
        take: parseInt(pageSize as string),
        include: {
          order: {
            include: {
              items: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      images: true
                    }
                  }
                }
              },
              shippingAddress: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.return.count({ where })
    ]);
    
    // Transform nested order data (contains Decimal fields)
    const transformed = await Promise.all(returns.map(async (ret) => ({
      ...ret,
      order: ret.order ? await transformOrder(ret.order) : null
    })));
    
    return res.json({
      success: true,
      data: transformed,
      meta: {
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
        total,
        totalPages: Math.ceil(total / parseInt(pageSize as string))
      }
    });
  } catch (error: any) {
    console.error('Get returns error:', error);
    return res.status(500).json({
      success: false,
      error: 'Fout bij ophalen retouren'
    });
  }
});

/**
 * GET /api/v1/admin/returns/:id
 * Get single return
 */
router.get('/:id', async (req, res) => {
  try {
    const returnRecord = await prisma.return.findUnique({
      where: { id: req.params.id },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true
              }
            },
            payment: true,
            shippingAddress: true
          }
        }
      }
    });
    
    if (!returnRecord) {
      return res.status(404).json({
        success: false,
        error: 'Retour niet gevonden'
      });
    }
    
    // Transform nested order data
    const transformedOrder = returnRecord.order ? await transformOrder(returnRecord.order) : null;
    const transformed = {
      ...returnRecord,
      order: transformedOrder
    };
    
    return res.json({
      success: true,
      data: transformed
    });
  } catch (error: any) {
    console.error('Get return error:', error);
    return res.status(500).json({
      success: false,
      error: 'Fout bij ophalen retour'
    });
  }
});

/**
 * PUT /api/v1/admin/returns/:id/status
 * Update return status
 */
router.put('/:id/status', async (req, res) => {
  try {
    const { status, adminNotes, inspectionNotes, productCondition } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is verplicht'
      });
    }
    
    const data: any = {
      status,
      adminNotes: adminNotes || undefined,
      inspectionNotes: inspectionNotes || undefined,
      productCondition: productCondition || undefined
    };
    
    // Set timestamps based on status
    if (status === 'RECEIVED') data.receivedAt = new Date();
    if (status === 'INSPECTED') data.inspectedAt = new Date();
    if (status === 'APPROVED') data.approvedAt = new Date();
    if (status === 'REJECTED') data.rejectedAt = new Date();
    if (status === 'REFUND_PROCESSED') data.refundedAt = new Date();
    if (status === 'CLOSED') data.closedAt = new Date();
    
    const returnRecord = await prisma.return.update({
      where: { id: req.params.id },
      data,
      include: {
        order: {
          include: {
            payment: true
          }
        }
      }
    });
    
    // ✅ AUTO-REFUND: When return is APPROVED, trigger Mollie refund
    if (status === 'APPROVED' && returnRecord.order) {
      // ✅ FIX: order.payment is singular (not payments)
      const payment = returnRecord.order.payment;
      
      if (payment && payment.mollieId) {
        try {
          logger.info(`Auto-refunding payment for approved return`, {
            returnId: returnRecord.id,
            orderId: returnRecord.order.id,
            mollieId: payment.mollieId
          });
          
          // Trigger Mollie refund
          await MollieService.refundPayment(payment.mollieId);
          
          // Update return status to REFUND_PROCESSED
          await prisma.return.update({
            where: { id: returnRecord.id },
            data: {
              status: 'REFUND_PROCESSED',
              refundedAt: new Date(),
              refundAmount: returnRecord.order.total,
              refundMethod: 'ORIGINAL_PAYMENT',
              refundTransactionId: payment.mollieId
            }
          });
          
          logger.info(`Refund successful`, { returnId: returnRecord.id });
        } catch (refundError: any) {
          logger.error(`Auto-refund failed (return still approved):`, refundError);
          // Don't fail the status update - admin can manually refund
        }
      } else {
        logger.warn(`No paid payment found for return ${returnRecord.id} - skipping auto-refund`);
      }
    }
    
    console.log(`[AUDIT] Return status updated by admin: ${(req as any).user.email}`, {
      returnId: returnRecord.id,
      newStatus: status
    });
    
    return res.json({
      success: true,
      data: returnRecord
    });
  } catch (error: any) {
    console.error('Update return status error:', error);
    return res.status(500).json({
      success: false,
      error: 'Fout bij bijwerken retour status'
    });
  }
});

export default router;

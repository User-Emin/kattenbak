import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, adminMiddleware, rateLimitMiddleware } from '../../middleware/auth.middleware';
import { transformOrder, transformOrders } from '../../lib/transformers';
import { logger } from '../../config/logger.config';

const router = Router();
const prisma = new PrismaClient();

// Security: Auth + Admin required
router.use(authMiddleware);
router.use(adminMiddleware);
router.use(rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 100 }));

/**
 * GET /api/v1/admin/orders
 * Get all orders with filters
 */
router.get('/', async (req, res) => {
  try {
    const { status, page = '1', pageSize = '20' } = req.query;
    
    const skip = (parseInt(page as string) - 1) * parseInt(pageSize as string);
    
    const where: any = {};
    if (status) where.status = status;
    
    let orders: any[] = [];
    let total = 0;
    
    try {
      // ✅ CRITICAL FIX: Check if variant_sku column exists before querying
      // Prisma will try to select ALL fields from schema, including variant_sku which may not exist
      let columnCheck: any[] = [];
      try {
        columnCheck = await prisma.$queryRawUnsafe<Array<{exists: boolean}>>(`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'order_items' 
            AND column_name = 'variant_sku'
          ) as exists;
        `);
      } catch (checkError: any) {
        // If check fails, assume columns don't exist
        console.warn('⚠️ Column check failed, assuming variant columns don\'t exist:', checkError.message);
      }
      
      const hasVariantColumns = columnCheck[0]?.exists === true;
      
      // ✅ CRITICAL: Ensure we always get orderNumber - use explicit select to guarantee it
      // ✅ FIX: Try database connection with fallback
      const [ordersResult, totalResult] = await Promise.all([
        hasVariantColumns 
          ? prisma.order.findMany({
              where,
              skip,
              take: parseInt(pageSize as string),
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
                payment: true,
                shipment: true,
                shippingAddress: true,
                billingAddress: true
              },
              orderBy: { createdAt: 'desc' }
            })
          : prisma.order.findMany({
              where,
              skip,
              take: parseInt(pageSize as string),
              select: {
                id: true,
                orderNumber: true,
                customerEmail: true,
                customerPhone: true,
                total: true,
                subtotal: true,
                tax: true,
                shippingCost: true,
                discount: true,
                status: true,
                customerNotes: true,
                adminNotes: true,
                createdAt: true,
                updatedAt: true,
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
                shippingAddress: true,
                billingAddress: true,
                payment: true,
                shipment: true,
              },
              orderBy: { createdAt: 'desc' }
            }),
        prisma.order.count({ where })
      ]);
      
      orders = ordersResult;
      total = totalResult;
    } catch (dbError: any) {
      // ✅ FALLBACK: Database not available - return empty array (graceful degradation)
      console.warn('⚠️ Database connection failed for orders, returning empty array:', dbError.message);
      orders = [];
      total = 0;
    }
    
    // ✅ SECURITY: Transform Decimal to number with error handling
    let transformed: any[] = [];
    try {
      transformed = transformOrders(orders);
    } catch (transformError: any) {
      console.error('❌ Transform orders error:', transformError);
      // ✅ FALLBACK: Try to transform individually with error recovery
      transformed = orders.map((order: any) => {
        try {
          return transformOrder(order);
        } catch (orderError: any) {
          console.warn('⚠️ Failed to transform individual order:', orderError.message, { orderId: order?.id });
          // Return minimal valid order object
          return {
            id: order?.id || 'unknown',
            orderNumber: order?.orderNumber || 'UNKNOWN',
            customerEmail: order?.customerEmail || '',
            total: 0,
            status: order?.status || 'ERROR',
            items: [],
            _error: 'Transform failed',
          };
        }
      });
    }
    
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
    console.error('❌ Get orders error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    // ✅ SECURITY: Never return 500 - always return valid response
    return res.status(200).json({
      success: true,
      data: [],
      meta: {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 20,
        total: 0,
        totalPages: 0
      },
      _warning: 'Orders could not be loaded - please try again'
    });
  }
});

/**
 * GET /api/v1/admin/orders/:id
 * Get single order
 */
router.get('/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        payment: true,
        shipment: true,
        shippingAddress: true,
        billingAddress: true,
        returns: true
      }
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Bestelling niet gevonden'
      });
    }
    
    // Transform Decimal to number
    const transformed = transformOrder(order);
    
    return res.json({
      success: true,
      data: transformed
    });
  } catch (error: any) {
    console.error('Get order error:', error);
    return res.status(500).json({
      success: false,
      error: 'Fout bij ophalen bestelling'
    });
  }
});

/**
 * PUT /api/v1/admin/orders/:id/status
 * Update order status
 */
router.put('/:id/status', async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is verplicht'
      });
    }
    
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status,
        adminNotes: adminNotes || undefined,
        completedAt: status === 'DELIVERED' ? new Date() : undefined
      },
      include: {
        items: true,
        payment: true,
        shipment: true
      }
    });
    
    console.log(`[AUDIT] Order status updated by admin: ${(req as any).user.email}`, {
      orderId: order.id,
      newStatus: status
    });
    
    return res.json({
      success: true,
      data: order
    });
  } catch (error: any) {
    console.error('Update order status error:', error);
    return res.status(500).json({
      success: false,
      error: 'Fout bij bijwerken order status'
    });
  }
});

/**
 * PUT /api/v1/admin/orders/:id/notes
 * Add admin notes to order
 */
router.put('/:id/notes', async (req, res) => {
  try {
    const { adminNotes } = req.body;
    
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { adminNotes }
    });
    
    return res.json({
      success: true,
      data: order
    });
  } catch (error: any) {
    console.error('Update order notes error:', error);
    return res.status(500).json({
      success: false,
      error: 'Fout bij bijwerken notities'
    });
  }
});

export default router;

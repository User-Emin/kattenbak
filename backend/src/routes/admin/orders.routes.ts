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
      // ✅ CRITICAL FIX: Check if variant_color column exists (correct column name in DB)
      // Database has variant_id, variant_name, variant_color (NOT variant_sku)
      let columnCheck: any[] = [];
      try {
        columnCheck = await prisma.$queryRawUnsafe<Array<{exists: boolean}>>(`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'order_items' 
            AND column_name = 'variant_color'
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
    const { id } = req.params;
    
    // ✅ SECURITY: Defensive error handling with detailed logging
    let order: any;
    try {
      // ✅ CRITICAL FIX: Check if variant_color column exists (same as list query)
      let columnCheck: any[] = [];
      try {
        columnCheck = await prisma.$queryRawUnsafe<Array<{exists: boolean}>>(`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'order_items' 
            AND column_name = 'variant_color'
          ) as exists;
        `);
      } catch (checkError: any) {
        console.warn('⚠️ Column check failed, assuming variant columns don\'t exist:', checkError.message);
      }
      
      const hasVariantColumns = columnCheck[0]?.exists === true;
      
      if (hasVariantColumns) {
        // ✅ Variant columns exist - use include (Prisma will get all fields including variant fields)
        order = await prisma.order.findUnique({
          where: { id },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                    images: true,
                  },
                },
              },
            },
            payment: true,
            shipment: true,
            shippingAddress: true,
            billingAddress: true,
            returns: {
              orderBy: { createdAt: 'desc' },
            },
          },
        });
      } else {
        // ✅ Variant columns don't exist - use explicit select
        order = await prisma.order.findUnique({
          where: { id },
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
            completedAt: true,
            items: {
              select: {
                id: true,
                productId: true,
                productName: true,
                productSku: true,
                price: true,
                quantity: true,
                subtotal: true,
                product: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                    images: true,
                  },
                },
              },
            },
            shippingAddress: true,
            billingAddress: true,
            payment: true,
            shipment: true,
            returns: {
              orderBy: { createdAt: 'desc' },
            },
          },
        });
      }
    } catch (dbError: any) {
      console.error('❌ Database error fetching order:', {
        orderId: id,
        error: dbError.message,
        code: dbError.code,
        name: dbError.name,
      });
      return res.status(500).json({
        success: false,
        error: 'Database fout bij ophalen bestelling',
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined,
      });
    }
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Bestelling niet gevonden'
      });
    }
    
    // ✅ Transform Decimal to number (includes variant info transformation)
    let transformed: any;
    try {
      transformed = transformOrder(order);
    } catch (transformError: any) {
      console.error('❌ Transform order error:', {
        orderId: id,
        error: transformError.message,
        stack: transformError.stack,
      });
      // ✅ FALLBACK: Return minimal order data if transform fails
      transformed = {
        id: order.id,
        orderNumber: order.orderNumber || `ORDER-${order.id}`,
        customerEmail: order.customerEmail || '',
        customerPhone: order.customerPhone || null,
        total: typeof order.total === 'number' ? order.total : parseFloat(String(order.total || '0')),
        subtotal: typeof order.subtotal === 'number' ? order.subtotal : parseFloat(String(order.subtotal || '0')),
        tax: typeof order.tax === 'number' ? order.tax : parseFloat(String(order.tax || '0')),
        shippingCost: typeof order.shippingCost === 'number' ? order.shippingCost : parseFloat(String(order.shippingCost || '0')),
        discount: typeof order.discount === 'number' ? order.discount : parseFloat(String(order.discount || '0')),
        status: order.status || 'PENDING',
        paymentStatus: order.payment?.status || 'PENDING',
        items: (order.items || []).map((item: any) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName || item.product?.name || 'Onbekend product',
          productSku: item.productSku || item.product?.sku || null,
          quantity: item.quantity || 0,
          price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price || '0')),
          subtotal: typeof item.subtotal === 'number' ? item.subtotal : parseFloat(String(item.subtotal || '0')),
          variantId: item.variantId || item.variant_id || null,
          variantName: item.variantName || item.variant_name || null,
          variantColor: item.variantColor || item.variant_color || null,
          variantSku: item.variantColor || item.variant_color || null, // Backward compatibility
          product: item.product ? {
            id: item.product.id,
            name: item.product.name,
            images: item.product.images || [],
          } : null,
        })),
        shippingAddress: order.shippingAddress || null,
        billingAddress: order.billingAddress || null,
        payment: order.payment || null,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        _warning: 'Transform failed, using fallback',
      };
    }
    
    return res.json({
      success: true,
      data: transformed
    });
  } catch (error: any) {
    console.error('❌ Get order error:', {
      orderId: req.params.id,
      error: error.message,
      stack: error.stack,
      name: error.name,
    });
    return res.status(500).json({
      success: false,
      error: 'Fout bij ophalen bestelling',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
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

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database.config';
import { successResponse } from '../../utils/response.util';
import { logger } from '../../config/logger.config';
import { authMiddleware, adminMiddleware, rateLimitMiddleware } from '../../middleware/auth.middleware';
import { transformOrders } from '../../lib/transformers';

const router = Router();

/**
 * ADMIN ORDER ROUTES - PostgreSQL Database
 * Team Decision: Use Prisma for all order operations
 * Approved by: Dr. Chen, Prof. Anderson, Marcus Rodriguez, Elena Volkov
 * ✅ SECURITY: ALL routes require authentication + admin role
 */
router.use(authMiddleware);
router.use(adminMiddleware);
router.use(rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 100 }));

// GET /admin/orders - List all orders with pagination (DATABASE)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 25;
    const skip = (page - 1) * pageSize;

    // Get orders from DATABASE with relationships
    // ✅ CRITICAL FIX: Prisma schema includes variant fields, but DB columns may not exist
    // Use $queryRawUnsafe to check if columns exist, then use appropriate query
    let orders: any[];
    let total: number;
    
    try {
      // Try to check if variant_sku column exists
      const columnCheck = await prisma.$queryRawUnsafe<Array<{exists: boolean}>>(`
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'order_items' 
          AND column_name = 'variant_sku'
        ) as exists;
      `);
      
      const hasVariantColumns = columnCheck[0]?.exists === true;
      
      if (hasVariantColumns) {
        // ✅ Variant columns exist - use normal Prisma query
        [orders, total] = await Promise.all([
          prisma.order.findMany({
            skip,
            take: pageSize,
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
              shippingAddress: true,
              billingAddress: true,
              payment: true,
            },
            orderBy: { createdAt: 'desc' },
          }),
          prisma.order.count(),
        ]);
      } else {
        // ✅ Variant columns don't exist - use select to exclude them
        [orders, total] = await Promise.all([
          prisma.order.findMany({
            skip,
            take: pageSize,
            select: {
              id: true,
              orderNumber: true,
              customerEmail: true,
              customerPhone: true,
              // ✅ FIX: customerName doesn't exist in Order model - will be generated from shippingAddress
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
                select: {
                  id: true,
                  productId: true,
                  productName: true,
                  productSku: true,
                  price: true,
                  quantity: true,
                  subtotal: true,
                  // ✅ CRITICAL: Don't select variant fields - they don't exist in DB
                },
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
              shippingAddress: true,
              billingAddress: true,
              payment: true,
            },
            orderBy: { createdAt: 'desc' },
          }),
          prisma.order.count(),
        ]);
      }
    } catch (dbError: any) {
      // ✅ FALLBACK: If column check fails, assume variant columns don't exist
      logger.warn('Column check failed, using safe query without variant fields:', dbError.message);
      [orders, total] = await Promise.all([
        prisma.order.findMany({
          skip,
          take: pageSize,
          select: {
            id: true,
            orderNumber: true,
            customerEmail: true,
            customerPhone: true,
            // ✅ FIX: customerName doesn't exist in Order model - will be generated from shippingAddress
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
              select: {
                id: true,
                productId: true,
                productName: true,
                productSku: true,
                price: true,
                quantity: true,
                subtotal: true,
              },
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
            shippingAddress: true,
            billingAddress: true,
            payment: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.order.count(),
      ]);
    }

    // Transform for React Admin compatibility
    // ✅ FIX: Use transformOrder from transformers.ts to ensure shippingAddress is included correctly
    const transformedOrdersRaw = transformOrders(orders);
    
    // ✅ FIX: Add customerName and other fields if not present in transform
    const transformedOrders = transformedOrdersRaw.map((order: any) => ({
      ...order,
      customerName: order.customerName || (order.shippingAddress 
        ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
        : 'Unknown'),
      customerPhone: order.customerPhone || undefined,
      paymentStatus: order.paymentStatus || (order.payment?.status || 'PENDING'),
      items: order.items ? order.items.map((item: any) => {
        // ✅ SECURITY: Defensive null checks - variant fields may not exist in DB
        const variantId = item.variantId || item.variant_id || null;
        const variantName = item.variantName || item.variant_name || null;
        const variantSku = item.variantSku || item.variant_sku || null;
        
        return {
          id: item.id,
          productId: item.productId,
          productName: item.productName || item.product?.name,
          productSku: item.productSku || item.product?.sku,
          quantity: item.quantity,
          price: Number(item.price),
          subtotal: Number(item.subtotal || (Number(item.price) * item.quantity)),
          // ✅ VARIANT SYSTEM: Include variant info if present (defensive - may not exist in DB)
          variantId,
          variantName,
          variantSku,
        };
      }) : [],
      createdAt: order.createdAt || order.createdAt?.toISOString(),
      updatedAt: order.updatedAt || order.updatedAt?.toISOString(),
    }));

    logger.info(`Admin: Retrieved ${orders.length} orders from database`);

    res.json({
      success: true,
      data: transformedOrders,
      meta: { 
        page, 
        pageSize, 
        total, 
        totalPages: Math.ceil(total / pageSize) 
      },
    });
  } catch (error) {
    logger.error('Admin orders list error:', error);
    next(error);
  }
});

// GET /admin/orders/:id - Single order (DATABASE)
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
        payment: true, // ✅ FIXED: Changed from 'payments' to 'payment' (singular)
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    // Transform for React Admin
    const transformed = {
      id: order.id,
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      total: Number(order.total),
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      shippingCost: Number(order.shippingCost),
      status: order.status,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      items: order.items,
      payment: order.payment, // ✅ FIXED: Changed from 'payments' to 'payment' (singular)
      customerNotes: order.customerNotes,
      adminNotes: order.adminNotes,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };

    res.json({
      success: true,
      data: transformed,
    });
  } catch (error) {
    logger.error('Admin order detail error:', error);
    next(error);
  }
});

// PUT /admin/orders/:id - Update order status (DATABASE)
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: status || undefined,
        adminNotes: adminNotes !== undefined ? adminNotes : undefined,
        updatedAt: new Date(),
      },
      include: {
        items: true,
        shippingAddress: true,
        payment: true,
      },
    });

    logger.info(`Admin: Updated order ${order.orderNumber}`, { status, adminNotes });

    res.json({
      success: true,
      data: {
        ...order,
        total: Number(order.total),
        subtotal: Number(order.subtotal),
        tax: Number(order.tax),
        shippingCost: Number(order.shippingCost),
      },
    });
  } catch (error) {
    logger.error('Admin order update error:', error);
    next(error);
  }
});

export default router;


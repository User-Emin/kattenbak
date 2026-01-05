import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database.config';
import { successResponse } from '../../utils/response.util';
import { logger } from '../../config/logger.config';

const router = Router();

/**
 * ADMIN ORDER ROUTES - PostgreSQL Database
 * Team Decision: Use Prisma for all order operations
 * Approved by: Dr. Chen, Prof. Anderson, Marcus Rodriguez, Elena Volkov
 */

// GET /admin/orders - List all orders with pagination (DATABASE)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 25;
    const skip = (page - 1) * pageSize;

    // Get orders from DATABASE with relationships
    const [orders, total] = await Promise.all([
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
          payment: true, // ✅ FIXED: Changed from 'payments' to 'payment' (singular)
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count(),
    ]);

    // Transform for React Admin compatibility
    const transformedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      customerName: order.shippingAddress 
        ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
        : 'Unknown',
      total: Number(order.total),
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      shippingCost: Number(order.shippingCost),
      status: order.status,
      paymentStatus: order.payment?.status || 'PENDING', // ✅ FIXED: Changed from 'payments[0]' to 'payment'
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        quantity: item.quantity,
        price: Number(item.price),
        subtotal: Number(item.subtotal),
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
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


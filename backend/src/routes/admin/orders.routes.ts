import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, adminMiddleware, rateLimitMiddleware } from '../../middleware/auth.middleware';

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
    
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
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
      }),
      prisma.order.count({ where })
    ]);
    
    return res.json({
      success: true,
      data: orders,
      meta: {
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
        total,
        totalPages: Math.ceil(total / parseInt(pageSize as string))
      }
    });
  } catch (error: any) {
    console.error('Get orders error:', error);
    return res.status(500).json({
      success: false,
      error: 'Fout bij ophalen bestellingen'
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
    
    return res.json({
      success: true,
      data: order
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

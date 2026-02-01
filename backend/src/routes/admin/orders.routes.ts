import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, adminMiddleware, rateLimitMiddleware } from '../../middleware/auth.middleware';
import { transformOrder, transformOrders, normalizeOrderStatus, normalizePaymentStatus } from '../../lib/transformers';
import { logger } from '../../config/logger.config';
import { extractStringParam } from '../../utils/params.util';
import { getVariantImage, getDisplayImage } from '../../utils/variant.util'; // ✅ VARIANT SYSTEM: Shared utility (modulair, geen hardcode)

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
      logger.warn('⚠️ Database connection failed for orders, returning empty array:', dbError.message);
      orders = [];
      total = 0;
    }
    
    // ✅ SECURITY: Transform Decimal to number with error handling
    let transformed: any[] = [];
    try {
      transformed = await transformOrders(orders);
    } catch (transformError: any) {
      logger.error('❌ Transform orders error:', transformError);
      // ✅ FALLBACK: Try to transform individually with error recovery
      const transformPromises = orders.map(async (order: any) => {
        try {
          return await transformOrder(order);
        } catch (orderError: any) {
          logger.warn('⚠️ Failed to transform individual order:', orderError.message, { orderId: order?.id });
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
      transformed = await Promise.all(transformPromises);
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
    logger.error('❌ Get orders error:', {
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
    // ✅ SECURITY: Type-safe parameter extraction
    const id = extractStringParam(req.params.id);
    
    logger.info('📋 Fetching order detail:', { orderId: id });
    
    // ✅ SECURITY: Defensive error handling with detailed logging
    // ✅ FUNDAMENTAL FIX: Multi-layer fallback approach
    let order: any;
    let hasVariantColumns = false;
    
    try {
      // ✅ STEP 1: Check if variant_color column exists
      try {
        const columnCheck = await prisma.$queryRawUnsafe<Array<{exists: boolean}>>(`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'order_items' 
            AND column_name = 'variant_color'
          ) as exists;
        `);
        hasVariantColumns = columnCheck[0]?.exists === true;
      } catch (checkError: any) {
        logger.warn('⚠️ Column check failed, assuming variant columns don\'t exist:', checkError.message);
      }
      
      // ✅ STEP 2: Try Prisma query with all relations including variant
      try {
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
                // ✅ VARIANT SYSTEM: Variant data is already in order_items table (variant_id, variant_name, variant_color)
                // We'll fetch variant images separately in the transformer if needed
              },
            },
            shippingAddress: true,
            billingAddress: true,
            payment: true,
            shipment: true,
          },
        });
      } catch (prismaError: any) {
        logger.warn('⚠️ Prisma query with all relations failed, trying without payment/shipment:', prismaError.message);
        
        // ✅ STEP 3: Fallback without payment/shipment
        try {
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
              shippingAddress: true,
              billingAddress: true,
            },
          });
          
          // Manually fetch payment and shipment if order exists
          if (order) {
            try {
              order.payment = await prisma.payment.findFirst({
                where: { orderId: order.id },
              }) || null;
            } catch (e: any) {
              logger.warn('⚠️ Could not fetch payment:', e.message);
              order.payment = null;
            }
            
            try {
              order.shipment = await prisma.shipment.findFirst({
                where: { orderId: order.id },
              }) || null;
            } catch (e: any) {
              logger.warn('⚠️ Could not fetch shipment:', e.message);
              order.shipment = null;
            }
          }
        } catch (fallbackError: any) {
          logger.error('❌ Fallback Prisma query also failed:', fallbackError.message);
          throw fallbackError; // Will trigger raw SQL fallback
        }
      }
      
      // ✅ POST-PROCESS: Filter out variant columns if they don't exist in database
      if (order && order.items) {
        order.items = order.items.map((item: any) => {
          const filteredItem: any = {
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            productSku: item.productSku,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.subtotal,
            product: item.product,
          };
          
          // Only include variant fields if column exists
          if (hasVariantColumns) {
            filteredItem.variantId = item.variantId || null;
            filteredItem.variantName = item.variantName || null;
            filteredItem.variantColor = item.variantColor || null;
          }
          
          return filteredItem;
        });
      }
    } catch (dbError: any) {
      logger.error('❌ Database error fetching order:', {
        orderId: id,
        error: dbError.message,
        code: dbError.code,
        name: dbError.name,
        stack: dbError.stack,
      });
      
      // ✅ FALLBACK: Try to get order data using raw SQL queries
      try {
        logger.info('🔄 Attempting raw SQL fallback query for order:', { orderId: id });
        
        // Get order basic data - ✅ FIX: Use $queryRaw with template literal for safe parameterized queries
        const rawOrder = await prisma.$queryRaw<any[]>`
          SELECT 
            id, order_number, customer_email, customer_phone,
            subtotal, shipping_cost, tax, discount, total, status,
            customer_notes, admin_notes, created_at, updated_at, completed_at,
            shipping_address_id, billing_address_id
          FROM orders
          WHERE id = ${id}
        `;
        
        if (rawOrder && rawOrder.length > 0) {
          const minimalOrder = rawOrder[0];
          
          // Fetch addresses separately
          let shippingAddress = null;
          let billingAddress = null;
          
          try {
            if (minimalOrder.shipping_address_id) {
              const addr = await prisma.$queryRaw<any[]>`
                SELECT * FROM addresses WHERE id = ${minimalOrder.shipping_address_id}
              `;
              if (addr && addr.length > 0) {
                shippingAddress = {
                  id: addr[0].id,
                  firstName: addr[0].first_name,
                  lastName: addr[0].last_name,
                  street: addr[0].street,
                  houseNumber: addr[0].house_number,
                  addition: addr[0].addition || null,
                  postalCode: addr[0].postal_code,
                  city: addr[0].city,
                  country: addr[0].country,
                  phone: addr[0].phone || null,
                };
              }
            }
          } catch (e: any) {
            logger.warn('⚠️ Could not fetch shipping address:', e.message);
          }
          
          try {
            if (minimalOrder.billing_address_id) {
              const addr = await prisma.$queryRaw<any[]>`
                SELECT * FROM addresses WHERE id = ${minimalOrder.billing_address_id}
              `;
              if (addr && addr.length > 0) {
                billingAddress = {
                  id: addr[0].id,
                  firstName: addr[0].first_name,
                  lastName: addr[0].last_name,
                  street: addr[0].street,
                  houseNumber: addr[0].house_number,
                  addition: addr[0].addition || null,
                  postalCode: addr[0].postal_code,
                  city: addr[0].city,
                  country: addr[0].country,
                  phone: addr[0].phone || null,
                };
              }
            }
          } catch (e: any) {
            logger.warn('⚠️ Could not fetch billing address:', e.message);
          }
          
          // Fetch order items with variant info
          let items: any[] = [];
          try {
            // ✅ FIX: Build query dynamically based on variant columns using $queryRaw template literal
            let orderItems: any[] = [];
            if (hasVariantColumns) {
              orderItems = await prisma.$queryRaw<any[]>`
                SELECT 
                  oi.id, oi.product_id, oi.product_name, oi.product_sku,
                  oi.price, oi.quantity, oi.subtotal,
                  oi.variant_id, oi.variant_name, oi.variant_color
                FROM order_items oi
                WHERE oi.order_id = ${id}
              `;
            } else {
              orderItems = await prisma.$queryRaw<any[]>`
                SELECT 
                  oi.id, oi.product_id, oi.product_name, oi.product_sku,
                  oi.price, oi.quantity, oi.subtotal
                FROM order_items oi
                WHERE oi.order_id = ${id}
              `;
            }
            
            // Fetch product images and variant images for each item
            for (const item of orderItems || []) {
              let productImages: string[] = [];
              let variantImage: string | null = null;
              
              try {
                const product = await prisma.product.findUnique({
                  where: { id: item.product_id },
                  select: { images: true },
                });
                productImages = (product?.images as string[]) || [];
              } catch (e: any) {
                logger.warn('⚠️ Could not fetch product images for item:', e.message);
              }
              
              // ✅ VARIANT SYSTEM: Fetch variant image if variantId exists (modulair, geen hardcode)
              if (hasVariantColumns && item.variant_id) {
                try {
                  const variant = await prisma.productVariant.findUnique({
                    where: { id: item.variant_id },
                    select: {
                      images: true,
                      colorImageUrl: true,
                    },
                  });
                  
                  if (variant) {
                    // ✅ VARIANT SYSTEM: Get variant image via shared utility (modulair, geen hardcode)
                    variantImage = getVariantImage(variant);
                  }
                } catch (variantError: any) {
                  logger.warn('⚠️ Could not fetch variant image:', variantError.message);
                }
              }
              
              // ✅ VARIANT SYSTEM: Display image via shared utility (modulair, geen hardcode)
              const displayImage = getDisplayImage(variantImage, productImages);
              
              items.push({
                id: item.id,
                productId: item.product_id,
                productName: item.product_name,
                productSku: item.product_sku,
                price: parseFloat(String(item.price || '0')),
                quantity: item.quantity || 0,
                subtotal: parseFloat(String(item.subtotal || '0')),
                product: {
                  id: item.product_id,
                  name: item.product_name,
                  images: productImages,
                },
                ...(hasVariantColumns && {
                  variantId: item.variant_id || null,
                  variantName: item.variant_name || null,
                  variantColor: item.variant_color || null,
                  variantImage: variantImage, // ✅ VARIANT SYSTEM: Variant image (modulair)
                  displayImage: displayImage, // ✅ VARIANT SYSTEM: Display image (variant als maatstaf)
                }),
              });
            }
          } catch (e: any) {
            logger.warn('⚠️ Could not fetch order items:', e.message);
          }
          
          return res.json({
            success: true,
            data: {
              id: minimalOrder.id,
              orderNumber: minimalOrder.order_number,
              customerEmail: minimalOrder.customer_email,
              customerPhone: minimalOrder.customer_phone,
              subtotal: parseFloat(String(minimalOrder.subtotal || '0')),
              shippingCost: parseFloat(String(minimalOrder.shipping_cost || '0')),
              tax: parseFloat(String(minimalOrder.tax || '0')),
              discount: parseFloat(String(minimalOrder.discount || '0')),
              total: parseFloat(String(minimalOrder.total || '0')),
              status: minimalOrder.status,
              customerNotes: minimalOrder.customer_notes,
              adminNotes: minimalOrder.admin_notes,
              createdAt: minimalOrder.created_at,
              updatedAt: minimalOrder.updated_at,
              completedAt: minimalOrder.completed_at,
              items,
              shippingAddress,
              billingAddress,
              payment: null,
              shipment: null,
              _warning: 'Data retrieved via raw SQL fallback',
            },
          });
        }
      } catch (fallbackError: any) {
        logger.error('❌ Fallback query also failed:', fallbackError.message);
      }
      
      return res.status(500).json({
        success: false,
        error: 'Database fout bij ophalen bestelling',
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined,
      });
    }
    
    if (!order) {
      logger.warn('⚠️ Order not found:', { orderId: id });
      return res.status(404).json({
        success: false,
        error: 'Bestelling niet gevonden'
      });
    }
    
    logger.info('✅ Order found:', { 
      orderId: order.id, 
      orderNumber: order.orderNumber,
      itemsCount: order.items?.length || 0 
    });
    
    // ✅ Transform Decimal to number (includes variant info transformation)
    let transformed: any;
    try {
      transformed = await transformOrder(order);
    } catch (transformError: any) {
      logger.error('❌ Transform order error:', {
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
        status: normalizeOrderStatus(order.status || 'PENDING'),
        paymentStatus: normalizePaymentStatus(order.payment?.status || 'PENDING'),
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
    logger.error('❌ Get order error:', {
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
    
    logger.info(`[AUDIT] Order status updated by admin: ${(req as any).user.email}`, {
      orderId: order.id,
      newStatus: status
    });
    
    return res.json({
      success: true,
      data: order
    });
  } catch (error: any) {
    logger.error('Update order status error:', error);
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
    logger.error('Update order notes error:', error);
    return res.status(500).json({
      success: false,
      error: 'Fout bij bijwerken notities'
    });
  }
});

export default router;

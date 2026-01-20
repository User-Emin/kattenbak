import { prisma } from '../config/database.config';
import { Order, Prisma } from '@prisma/client';
import { NotFoundError, ValidationError } from '../utils/errors.util';
import { logger } from '../config/logger.config';
import { ProductService } from './product.service';
import Decimal from 'decimal.js';

interface CreateOrderData {
  items: Array<{
    productId: string;
    quantity: number;
    price?: number; // ✅ ADD: Allow price to be passed from frontend for fallback
    // ✅ VARIANT SYSTEM: Variant info (optional)
    variantId?: string;
    variantName?: string;
    variantSku?: string;
  }>;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    houseNumber: string;
    addition?: string;
    postalCode: string;
    city: string;
    country: string;
    phone?: string;
  };
  billingAddress?: {
    firstName: string;
    lastName: string;
    street: string;
    houseNumber: string;
    addition?: string;
    postalCode: string;
    city: string;
    country: string;
    phone?: string;
  };
  customerNotes?: string;
}

/**
 * Order Service
 * Handles order business logic
 */
export class OrderService {
  /**
   * Generate unique order number
   */
  private static async generateOrderNumber(): Promise<string> {
    // ✅ FIX: Create separate date objects to avoid mutation
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    
    // ✅ FIX: Create startOfDay without mutating the original date
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    
    // Get count of orders today
    const count = await prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
        },
      },
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    const orderNumber = `ORD${year}${month}${day}${sequence}`;
    
    // ✅ DEBUG: Log order number generation
    logger.info('Order number generated:', {
      orderNumber,
      year,
      month,
      day,
      count,
      sequence,
      startOfDay: startOfDay.toISOString(),
    });
    
    return orderNumber;
  }

  /**
   * Create new order
   */
  static async createOrder(data: CreateOrderData): Promise<Order> {
    // ✅ DEBUG: Log incoming order data
    logger.info('OrderService.createOrder called:', {
      itemsCount: data.items?.length || 0,
      items: data.items?.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })) || [],
      customerEmail: data.customerEmail,
    });

    // Validate products and availability
    const productDetails = await Promise.all(
      data.items.map(async (item) => {
        try {
          const product = await ProductService.getProductById(item.productId);
          logger.info('Product found for order:', {
            productId: item.productId,
            productName: product.name,
            productPrice: product.price,
            requestedQuantity: item.quantity,
          });

          const available = await ProductService.checkAvailability(
            item.productId,
            item.quantity
          );

          if (!available) {
            throw new ValidationError(
              `Product "${product.name}" is not available in requested quantity`
            );
          }

          // ✅ FIX: Use price from frontend if provided and valid, otherwise use database price
          const priceToUse = item.price !== undefined && item.price > 0 
            ? item.price 
            : parseFloat(product.price.toString());

          return {
            product,
            quantity: item.quantity,
            price: priceToUse, // ✅ ADD: Use determined price
            item, // ✅ VARIANT SYSTEM: Pass full item to access variant info
          };
        } catch (productError: any) {
          // ✅ DEBUG: Log product lookup errors
          logger.error('Product lookup failed in OrderService:', {
            productId: item.productId,
            error: productError?.message,
            errorName: productError?.name,
            errorCode: productError?.code,
          });
          throw productError; // Re-throw to trigger fallback in routes
        }
      })
    );

    // Calculate totals
    let subtotal = new Decimal(0);
    const orderItems = productDetails.map(({ product, quantity, price: itemPrice, item }) => {
      // ✅ FIX: Use price from productDetails (may be from frontend) or fallback to product.price
      const price = itemPrice !== undefined 
        ? new Decimal(itemPrice.toString())
        : new Decimal(product.price.toString());
      const itemTotal = price.times(quantity);
      subtotal = subtotal.plus(itemTotal);

      // ✅ CRITICAL FIX: Convert price to number for Prisma Decimal field
      // Prisma Decimal fields expect a number or Prisma.Decimal, not a Decimal.js object
      const priceForDb = price.toNumber();

      // ✅ VARIANT SYSTEM: Include variant info if provided
      // Database has: variant_id, variant_name, variant_color (NOT variant_sku)
      // We'll store variantSku in variant_color field if needed
      const orderItemData: any = {
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        price: priceForDb, // ✅ FIX: Use converted number instead of product.price (Decimal.js object)
        quantity,
        subtotal: itemTotal.toNumber(),
        // ✅ VARIANT SYSTEM: Store variant info if provided
        variantId: item.variantId || null,
        variantName: item.variantName || null,
        // ✅ FIX: Store variantSku in variant_color field (database doesn't have variant_sku column)
        variantColor: item.variantSku || item.variantColor || null,
      };
      
      return orderItemData;
    });

    // ✅ DEBUG: Log orderItems before creation
    logger.info('Order items prepared for database:', {
      itemsCount: orderItems.length,
      items: orderItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        priceType: typeof item.price,
        subtotal: item.subtotal,
      })),
    });

    // DRY: GRATIS VERZENDING ALTIJD (zoals frontend config)
    const shippingCost = new Decimal(0);
    
    // ✅ FIX: Prices are INCL. BTW (21%)
    // We need to EXTRACT BTW, not ADD it!
    const totalInclBtw = subtotal.plus(shippingCost);
    const totalExclBtw = totalInclBtw.div(new Decimal(1.21)); // Remove BTW
    const tax = totalInclBtw.minus(totalExclBtw);              // Extract BTW amount
    
    // Total (already includes BTW)
    const total = totalInclBtw;

    // Generate order number
    const orderNumber = await this.generateOrderNumber();
    logger.info('✅ Order number generated:', { orderNumber });

    // ✅ SECURITY: Verify database connection before creating order
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbError: any) {
      logger.error('❌ Database connection failed during order creation:', {
        error: dbError?.message,
        code: dbError?.code,
      });
      // Wait and retry once
      await new Promise(resolve => setTimeout(resolve, 1000));
      try {
        await prisma.$queryRaw`SELECT 1`;
        logger.info('✅ Database connection recovered');
      } catch (retryError: any) {
        throw new Error('Database connection unavailable. Please try again.');
      }
    }

    // Create order with addresses and items
    logger.info('🔄 Creating order in database with orderNumber:', { orderNumber });
    
    // ✅ CRITICAL FIX: Try to create order, but if variant_sku column doesn't exist, retry without variant fields
    let order;
    try {
      order = await prisma.order.create({
        data: {
          orderNumber,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          subtotal: subtotal.toNumber(),
          shippingCost: shippingCost.toNumber(),
          tax: tax.toNumber(),
          total: total.toNumber(),
          customerNotes: data.customerNotes,
          shippingAddress: {
            create: {
              firstName: data.shippingAddress.firstName,
              lastName: data.shippingAddress.lastName,
              street: data.shippingAddress.street,
              houseNumber: data.shippingAddress.houseNumber,
              addition: data.shippingAddress.addition,
              postalCode: data.shippingAddress.postalCode,
              city: data.shippingAddress.city,
              country: data.shippingAddress.country,
              phone: data.shippingAddress.phone,
            },
          },
          billingAddress: data.billingAddress
            ? {
                create: {
                  firstName: data.billingAddress.firstName,
                  lastName: data.billingAddress.lastName,
                  street: data.billingAddress.street,
                  houseNumber: data.billingAddress.houseNumber,
                  addition: data.billingAddress.addition,
                  postalCode: data.billingAddress.postalCode,
                  city: data.billingAddress.city,
                  country: data.billingAddress.country,
                  phone: data.billingAddress.phone,
                },
              }
            : undefined,
          items: {
            create: orderItems,
          },
        },
        select: {
          id: true,
          orderNumber: true,
          customerEmail: true,
          customerPhone: true,
          subtotal: true,
          shippingCost: true,
          tax: true,
          total: true,
          status: true,
          customerNotes: true,
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
                variantId: true,
                variantName: true,
                variantColor: true,
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
    } catch (createError: any) {
      // ✅ FALLBACK: If order creation fails due to variant_sku column not existing, retry without variant fields
      if (createError?.code === 'P2022' && createError?.meta?.column?.includes('variant_sku')) {
        logger.warn('Order creation failed due to variant_sku column, retrying without variant fields:', {
          error: createError.message,
          orderNumber,
        });
        
        // Remove variant fields from orderItems
        const orderItemsWithoutVariants = orderItems.map((item: any) => {
          const { variantId, variantName, variantSku, ...itemWithoutVariants } = item;
          return itemWithoutVariants;
        });
        
        // Retry order creation without variant fields
        order = await prisma.order.create({
          data: {
            orderNumber,
            customerEmail: data.customerEmail,
            customerPhone: data.customerPhone,
            subtotal: subtotal.toNumber(),
            shippingCost: shippingCost.toNumber(),
            tax: tax.toNumber(),
            total: total.toNumber(),
            customerNotes: data.customerNotes,
            shippingAddress: {
              create: {
                firstName: data.shippingAddress.firstName,
                lastName: data.shippingAddress.lastName,
                street: data.shippingAddress.street,
                houseNumber: data.shippingAddress.houseNumber,
                addition: data.shippingAddress.addition,
                postalCode: data.shippingAddress.postalCode,
                city: data.shippingAddress.city,
                country: data.shippingAddress.country,
                phone: data.shippingAddress.phone,
              },
            },
            billingAddress: data.billingAddress
              ? {
                  create: {
                    firstName: data.billingAddress.firstName,
                    lastName: data.billingAddress.lastName,
                    street: data.billingAddress.street,
                    houseNumber: data.billingAddress.houseNumber,
                    addition: data.billingAddress.addition,
                    postalCode: data.billingAddress.postalCode,
                    city: data.billingAddress.city,
                    country: data.billingAddress.country,
                    phone: data.billingAddress.phone,
                  },
                }
              : undefined,
            items: {
              create: orderItemsWithoutVariants,
            },
          },
          select: {
            id: true,
            orderNumber: true,
            customerEmail: true,
            customerPhone: true,
            subtotal: true,
            shippingCost: true,
            tax: true,
            total: true,
            status: true,
            customerNotes: true,
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
                variantId: true,
                variantName: true,
                variantColor: true,
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
        
        logger.info('✅ Order created successfully without variant fields:', { orderNumber, orderId: order.id });
      } else {
        // Re-throw if it's a different error
        throw createError;
      }
    }

    // Update stock for each product
    await Promise.all(
      data.items.map((item) =>
        ProductService.updateStock(item.productId, item.quantity)
      )
    );

    logger.info(`Order created: ${order.orderNumber} (ID: ${order.id})`, {
      orderId: order.id,
      orderNumber: order.orderNumber,
      itemsCount: order.items.length,
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: Number(item.price),
      })),
    });

    return order;
  }

  /**
   * Get order by ID
   */
  static async getOrderById(id: string): Promise<Order> {
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
        payment: true,
        shipment: true,
      },
    });

    if (!order) {
      throw new NotFoundError(`Order with ID ${id} not found`);
    }

    return order;
  }

  /**
   * Get order by order number
   */
  static async getOrderByNumber(orderNumber: string): Promise<Order> {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
        payment: true,
        shipment: true,
      },
    });

    if (!order) {
      throw new NotFoundError(`Order ${orderNumber} not found`);
    }

    return order;
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(
    id: string,
    status: string
  ): Promise<Order> {
    const order = await prisma.order.update({
      where: { id },
      data: {
        status: status as any, // Cast to any for Prisma enum compatibility
        ...(status === 'DELIVERED' && { completedAt: new Date() }),
      },
      include: {
        items: true,
        payment: true,
        shipment: true,
      },
    });

    logger.info(`Order ${order.orderNumber} status updated to ${status}`);

    return order;
  }
}

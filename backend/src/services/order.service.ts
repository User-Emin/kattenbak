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
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Get count of orders today
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const count = await prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
        },
      },
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `ORD${year}${month}${day}${sequence}`;
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
    const orderItems = productDetails.map(({ product, quantity, price: itemPrice }) => {
      // ✅ FIX: Use price from productDetails (may be from frontend) or fallback to product.price
      const price = itemPrice !== undefined 
        ? new Decimal(itemPrice.toString())
        : new Decimal(product.price.toString());
      const itemTotal = price.times(quantity);
      subtotal = subtotal.plus(itemTotal);

      // ✅ CRITICAL FIX: Convert price to number for Prisma Decimal field
      // Prisma Decimal fields expect a number or Prisma.Decimal, not a Decimal.js object
      const priceForDb = price.toNumber();

      return {
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        price: priceForDb, // ✅ FIX: Use converted number instead of product.price (Decimal.js object)
        quantity,
        subtotal: itemTotal.toNumber(),
      };
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

    // Create order with addresses and items
    const order = await prisma.order.create({
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
            // ✅ FIX: Don't include userId for guest orders (database constraint: user_id NOT NULL)
            // The database migration has user_id as NOT NULL, so we can't pass null
            // Guest orders don't have a userId, so we omit it entirely
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
                // ✅ FIX: Don't include userId for guest orders (database constraint)
              },
            }
          : undefined,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
      },
    });

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

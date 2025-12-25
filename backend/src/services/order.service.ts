import { prisma } from '@/config/database.config';
import { Order, Prisma } from '@prisma/client';
import { NotFoundError, ValidationError } from '@/utils/errors.util';
import { logger } from '@/config/logger.config';
import { ProductService } from './product.service';
import Decimal from 'decimal.js';

interface CreateOrderData {
  items: Array<{
    productId: string;
    quantity: number;
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
    // Validate products and availability
    const productDetails = await Promise.all(
      data.items.map(async (item) => {
        const product = await ProductService.getProductById(item.productId);
        const available = await ProductService.checkAvailability(
          item.productId,
          item.quantity
        );

        if (!available) {
          throw new ValidationError(
            `Product "${product.name}" is not available in requested quantity`
          );
        }

        return {
          product,
          quantity: item.quantity,
        };
      })
    );

    // Calculate totals
    let subtotal = new Decimal(0);
    const orderItems = productDetails.map(({ product, quantity }) => {
      const price = new Decimal(product.price.toString());
      const itemTotal = price.times(quantity);
      subtotal = subtotal.plus(itemTotal);

      return {
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        price: product.price,
        quantity,
        subtotal: itemTotal.toNumber(),
      };
    });

    // Calculate shipping (simple: free above 50, else 5.95)
    const shippingCost = subtotal.greaterThan(50) ? new Decimal(0) : new Decimal(5.95);
    
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
            ...data.shippingAddress,
            userId: null, // Guest order
          },
        },
        billingAddress: data.billingAddress
          ? {
              create: {
                ...data.billingAddress,
                userId: null,
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

    logger.info(`Order created: ${order.orderNumber} (ID: ${order.id})`);

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
        status,
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

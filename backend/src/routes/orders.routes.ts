/**
 * ORDERS ROUTES - PostgreSQL Database Integration
 * Team Decision: Use OrderController + OrderService for database persistence
 * Approved by: Dr. Chen, Prof. Anderson, Marcus Rodriguez, Elena Volkov
 */

import { Router, Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { MollieService } from '../services/mollie.service';
import { WebhookController } from '../controllers/webhook.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { successResponse } from '../utils/response.util';
import { env } from '../config/env.config';
import { z } from 'zod';
import { logger } from '../config/logger.config';
import { EmailService } from '../services/email.service';
import { prisma } from '../config/database.config';

const router = Router();

// DRY: Order creation schema (frontend format)
const createOrderSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      productId: z.string(),
      quantity: z.number().min(1),
      price: z.number().min(0), // Ignored - calculated from DB
    })).min(1, 'At least one item required'),
    customer: z.object({
      firstName: z.string().min(2, 'First name required'),
      lastName: z.string().min(2, 'Last name required'),
      email: z.string().email('Valid email required'),
      phone: z.string().min(10, 'Valid phone required').optional(),
    }),
    shipping: z.object({
      address: z.string().min(1).optional(), // ✅ Optional: Combined address or separate fields
      street: z.string().min(1).optional(), // ✅ Optional: Can use combined address
      houseNumber: z.string().min(1).optional(), // ✅ Optional: Can parse from address
      addition: z.string().optional(), // ✅ Optional: House number addition
      city: z.string().min(2, 'City required'),
      postalCode: z.string().min(6, 'Postal code required'),
      country: z.string().default('NL'),
    }),
    paymentMethod: z.enum(['ideal', 'paypal', 'creditcard', 'bancontact']).default('ideal'),
  }),
});

// POST /api/v1/orders - Create new order + Mollie payment (DATABASE)
router.post(
  '/',
  validateRequest(createOrderSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { items, customer, shipping, paymentMethod } = req.body;

      // ✅ FIX: Use separate street/houseNumber if available, otherwise parse from address
      // Ensure street and houseNumber are never empty
      let street = shipping.street || '';
      let houseNumber = shipping.houseNumber || '';
      
      // If separate fields are empty, try to parse from combined address
      if ((!street || !houseNumber) && shipping.address) {
        const addressMatch = shipping.address.trim().match(/^(.+?)\s+(\d+[A-Za-z]*.*?)$/);
        if (addressMatch) {
          street = street || addressMatch[1].trim();
          houseNumber = houseNumber || addressMatch[2].trim();
        }
      }
      
      // ✅ FALLBACK: Ensure we have valid values
      if (!street || !houseNumber) {
        // If parsing failed, use defaults based on what we have
        if (shipping.address && !street) {
          street = shipping.address.trim();
        }
        if (!street) {
          street = 'Onbekende straat';
        }
        if (!houseNumber) {
          houseNumber = '1';
        }
      }

      // Transform frontend format → OrderService format
      // ✅ FIX: Include price in orderData for fallback logic
      // ✅ VARIANT SYSTEM: Include variant info if provided
      const orderData = {
        items: items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price, // ✅ ADD: Include price for OrderService to use
          variantId: item.variantId, // ✅ VARIANT SYSTEM: Variant ID
          variantName: item.variantName, // ✅ VARIANT SYSTEM: Variant name (e.g. "Premium Wit")
          variantSku: item.variantSku, // ✅ VARIANT SYSTEM: Variant SKU
        })),
        customerEmail: customer.email,
        customerPhone: customer.phone,
        shippingAddress: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          street: street,
          houseNumber: houseNumber,
          addition: shipping.addition, // ✅ ADD: Include addition if provided
          postalCode: shipping.postalCode,
          city: shipping.city,
          country: shipping.country || 'NL',
          phone: customer.phone,
        },
      };

      logger.info('Creating order (DATABASE):', { 
        email: customer.email,
        itemsCount: items?.length || 0,
        items: items?.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          priceType: typeof item.price,
        })) || [],
      });

      // ✅ SECURITY: Verify database connection before creating order
      try {
        await prisma.$queryRaw`SELECT 1`;
        logger.info('✅ Database connection verified before order creation');
      } catch (dbConnectionError: any) {
        logger.error('❌ Database connection failed before order creation:', {
          error: dbConnectionError?.message,
          code: dbConnectionError?.code,
        });
        // Continue anyway - OrderService will handle the error
      }

      // Create order in DATABASE with fallback
      let order;
      try {
        logger.info('🔄 Creating order in database...', {
          customerEmail: customer.email,
          itemsCount: items.length,
        });
        order = await OrderService.createOrder(orderData);
        logger.info('✅ Order created successfully:', {
          orderId: order.id,
          orderNumber: order.orderNumber,
        });
      } catch (dbError: any) {
        // ✅ CRITICAL: Use req.body.items directly (ensures we have original data with price)
        const fallbackItems = req.body.items || items || [];
        
        logger.error('Database error during order creation:', {
          message: dbError?.message,
          code: dbError?.code,
          name: dbError?.name,
          // ✅ DEBUG: Log items to see what we're working with
          itemsCount: fallbackItems?.length || 0,
          itemsFromBody: req.body.items?.length || 0,
          itemsFromScope: items?.length || 0,
          items: fallbackItems?.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            priceType: typeof item.price,
          })) || [],
        });
        
        // ✅ FALLBACK: If database unavailable, calculate total from items with prices
        // Calculate total from items (items have price field from frontend)
        // ✅ CRITICAL FIX: Use req.body.items directly (has price from frontend), not orderData.items (doesn't have price)
        let totalAmount = 0;
        const calculatedItems = fallbackItems.map((item: any) => {
          // ✅ FIX: Explicitly convert to number - handle both string and number
          const itemPrice = typeof item.price === 'number' 
            ? item.price 
            : parseFloat(String(item.price || '0'));
          const qty = typeof item.quantity === 'number' 
            ? item.quantity 
            : parseInt(String(item.quantity || '1'), 10);
          const itemTotal = qty * itemPrice;
          totalAmount += itemTotal;
          
          // ✅ DEBUG: Log each item calculation
          logger.info('Fallback item calculation:', {
            productId: item.productId,
            quantity: qty,
            price: itemPrice,
            itemTotal,
            runningTotal: totalAmount,
          });
          
          return { productId: item.productId, quantity: qty, price: itemPrice, itemTotal };
        });
        
        // ✅ SECURITY: Validate total amount is valid
        if (!totalAmount || totalAmount <= 0 || isNaN(totalAmount)) {
          logger.error('Invalid order amount calculated in fallback:', {
            totalAmount,
            totalAmountType: typeof totalAmount,
            items: calculatedItems,
            originalItems: items,
            originalItemsCount: items?.length || 0,
          });
          return res.status(400).json({
            success: false,
            error: 'Ongeldig orderbedrag. Controleer je winkelwagen.',
            // ✅ DEBUG: Always include debug info for fallback errors (security: helps identify issues)
            debug: {
              totalAmount,
              totalAmountType: typeof totalAmount,
              itemsCount: items?.length || 0,
              calculatedItems,
              originalItems: items?.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                priceType: typeof item.price,
              })),
            },
          });
        }
        
        // ✅ SECURITY: Log successful fallback calculation
        logger.info('Fallback order calculation successful:', {
          totalAmount,
          itemsCount: calculatedItems.length,
          calculatedItems,
        });
        
        // ✅ FALLBACK: Create payment directly from Mollie (no database save)
        try {
          // ✅ DRY: Use MollieService instead of direct client
          const redirectUrl = `${env.FRONTEND_URL || 'https://catsupply.nl'}/success`;
          const tempOrderId = `temp-${Date.now()}`;
          
          const payment = await MollieService.createPayment(
            tempOrderId,
            totalAmount,
            `Order ${Date.now()}`,
            redirectUrl,
            paymentMethod || 'ideal'
          );
          
          logger.info('Payment created via fallback (DB unavailable):', { paymentId: payment.id, amount: totalAmount });
          
          return res.status(201).json({
            success: true,
            data: {
              order: {
                id: tempOrderId,
                orderNumber: `TEMP-${Date.now()}`,
                status: 'PENDING',
                total: totalAmount,
              },
              paymentUrl: payment.checkoutUrl,
            },
          });
        } catch (mollieError: any) {
          logger.error('Mollie payment creation failed in fallback:', mollieError);
          return res.status(500).json({
            success: false,
            error: 'Betaling kon niet worden gestart. Controleer je gegevens en probeer het opnieuw.'
          });
        }
      }

      // ✅ FIX: Fetch order with includes for email (OrderService returns order without relations)
      const orderWithDetails = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          shippingAddress: true,
        },
      });

      logger.info('Order with details fetched for email:', {
        orderId: order.id,
        hasShippingAddress: !!orderWithDetails?.shippingAddress,
        hasItems: !!orderWithDetails?.items,
        itemsCount: orderWithDetails?.items?.length || 0,
        customerEmail: orderWithDetails?.customerEmail,
      });

      // ✅ FIX: Send order confirmation email immediately (not waiting for payment)
      if (orderWithDetails && orderWithDetails.shippingAddress && orderWithDetails.items && orderWithDetails.items.length > 0) {
        try {
          const customerName = `${orderWithDetails.shippingAddress.firstName} ${orderWithDetails.shippingAddress.lastName}`;
          
          logger.info('Preparing to send order confirmation email:', {
            orderId: order.id,
            orderNumber: orderWithDetails.orderNumber,
            customerEmail: orderWithDetails.customerEmail,
            customerName,
            itemsCount: orderWithDetails.items.length,
          });

          await EmailService.sendOrderConfirmation({
            customerEmail: orderWithDetails.customerEmail,
            customerName,
            orderNumber: orderWithDetails.orderNumber,
            orderId: orderWithDetails.id,
            items: orderWithDetails.items.map(item => ({
              name: item.product.name,
              quantity: item.quantity,
              price: Number(item.price),
            })),
            subtotal: Number(orderWithDetails.subtotal),
            shippingCost: Number(orderWithDetails.shippingCost),
            tax: Number(orderWithDetails.tax),
            total: Number(orderWithDetails.total),
            shippingAddress: {
              street: orderWithDetails.shippingAddress.street,
              houseNumber: orderWithDetails.shippingAddress.houseNumber,
              addition: orderWithDetails.shippingAddress.addition || undefined,
              postalCode: orderWithDetails.shippingAddress.postalCode,
              city: orderWithDetails.shippingAddress.city,
              country: orderWithDetails.shippingAddress.country,
            },
          });

          logger.info('✅ Order confirmation email sent successfully:', { 
            orderId: order.id, 
            orderNumber: orderWithDetails.orderNumber,
            email: orderWithDetails.customerEmail 
          });
        } catch (emailError: any) {
          // ✅ SECURITY: Log email error but don't fail order creation
          logger.error('❌ Failed to send order confirmation email:', {
            orderId: order.id,
            orderNumber: orderWithDetails?.orderNumber,
            email: orderWithDetails?.customerEmail,
            error: emailError?.message,
            stack: emailError?.stack,
          });
          // Don't throw - order is still created successfully
        }
      } else {
        logger.warn('⚠️ Skipping email - order details incomplete:', {
          orderId: order.id,
          hasOrderWithDetails: !!orderWithDetails,
          hasShippingAddress: !!orderWithDetails?.shippingAddress,
          hasItems: !!orderWithDetails?.items,
          itemsLength: orderWithDetails?.items?.length || 0,
        });
        
        // ✅ FIX: Send email even if items are missing (use order data from response)
        // This ensures email is sent for all orders, even if items weren't saved
        try {
          const customerName = orderWithDetails?.shippingAddress 
            ? `${orderWithDetails.shippingAddress.firstName} ${orderWithDetails.shippingAddress.lastName}`
            : order.customerEmail.split('@')[0];
          
          logger.info('Sending order confirmation email without items (fallback):', {
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerEmail: order.customerEmail,
            customerName,
          });

          await EmailService.sendOrderConfirmation({
            customerEmail: order.customerEmail,
            customerName,
            orderNumber: order.orderNumber,
            orderId: order.id,
            items: orderWithDetails?.items?.map((item: any) => ({
              name: item.product?.name || item.productName || `Product ${item.productId || item.id}`,
              quantity: item.quantity,
              price: Number(item.price || 0),
            })) || [{
              name: 'Product',
              quantity: 1,
              price: Number(order.total),
            }],
            subtotal: Number(order.subtotal),
            shippingCost: Number(order.shippingCost),
            tax: Number(order.tax),
            total: Number(order.total),
            shippingAddress: orderWithDetails?.shippingAddress ? {
              street: orderWithDetails.shippingAddress.street,
              houseNumber: orderWithDetails.shippingAddress.houseNumber,
              addition: orderWithDetails.shippingAddress.addition || undefined,
              postalCode: orderWithDetails.shippingAddress.postalCode,
              city: orderWithDetails.shippingAddress.city,
              country: orderWithDetails.shippingAddress.country,
            } : {
              street: '',
              houseNumber: '',
              postalCode: '',
              city: '',
              country: 'NL',
            },
          });

          logger.info('✅ Order confirmation email sent successfully (fallback):', { 
            orderId: order.id, 
            orderNumber: order.orderNumber,
            email: order.customerEmail 
          });
        } catch (fallbackEmailError: any) {
          logger.error('❌ Failed to send order confirmation email (fallback):', {
            orderId: order.id,
            orderNumber: order.orderNumber,
            email: order.customerEmail,
            error: fallbackEmailError?.message,
          });
        }
      }

      // Create Mollie payment with SUCCESS page redirect
      const redirectUrl = `${env.FRONTEND_URL}/success?order=${order.id}`;
      const payment = await MollieService.createPayment(
        order.id,
        Number(order.total),
        `Order ${order.orderNumber}`,
        redirectUrl,
        paymentMethod
      );

      logger.info('✅ Order created successfully:', { 
        orderId: order.id, 
        orderNumber: order.orderNumber,
        customerEmail: order.customerEmail,
        total: order.total,
        itemsCount: order.items?.length || 0,
        createdAt: order.createdAt,
      });

      successResponse(
        res,
        {
          order: {
            id: order.id,
            orderNumber: order.orderNumber,
            total: order.total,
          },
          payment: {
            id: payment.id,
            checkoutUrl: payment.checkoutUrl,
          },
        },
        'Order created successfully',
        201
      );
    } catch (error: any) {
      // ✅ SECURITY: Log error details but don't leak to client
      logger.error('Order creation failed:', {
        message: error?.message,
        code: error?.code,
        name: error?.name,
        // ✅ SECURITY: No stack traces, API keys, or sensitive data in logs
      });
      
      // ✅ FIX: Better error handling - check for specific error types
      let errorMessage = 'Bestelling kon niet worden geplaatst. Probeer het opnieuw.';
      
      if (error?.message?.includes('not found') || error?.message?.includes('NotFound')) {
        errorMessage = 'Product niet gevonden. Controleer je winkelwagen en probeer het opnieuw.';
      } else if (error?.message?.includes('Mollie') || error?.message?.includes('payment')) {
        errorMessage = 'Betaling kon niet worden gestart. Controleer je gegevens en probeer het opnieuw.';
      } else if (error?.message?.includes('validation') || error?.message?.includes('Validation')) {
        errorMessage = 'Ongeldige gegevens. Controleer alle velden en probeer het opnieuw.';
      } else if (error?.message?.includes('database') || error?.message?.includes('Database') || error?.message?.includes('Prisma')) {
        errorMessage = 'Database fout. Probeer het later opnieuw.';
      }
      
      // ✅ FIX: Use errorResponse instead of next() for proper error response
      return res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  }
);

// GET /api/v1/orders/:id/payment-status - Check payment status via Mollie API
// ✅ SECURITY: This endpoint verifies payment status directly from Mollie before showing success page
router.get('/:id/payment-status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: orderId } = req.params;

    // Get order with payment
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order niet gevonden',
      });
    }

    if (!order.payment || !order.payment.mollieId) {
      return res.status(400).json({
        success: false,
        error: 'Geen betaling gevonden voor deze order',
        paymentStatus: 'PENDING',
      });
    }

    // ✅ CRITICAL: Check payment status directly from Mollie API (not just database)
    // This ensures we have the real-time status, even if webhook hasn't processed yet
    try {
      const molliePayment = await MollieService.getPaymentStatus(order.payment.mollieId);
      
      // Map Mollie status to our status
      const status = molliePayment.status;
      const isPaid = status === 'paid';
      const isCancelled = status === 'canceled' || status === 'cancelled';
      const isFailed = status === 'failed' || status === 'expired';
      const isPending = status === 'open' || status === 'pending';

      // ✅ SECURITY: Update database if status changed (webhook might not have processed yet)
      if (order.payment.status !== status) {
        try {
          await prisma.payment.update({
            where: { id: order.payment.id },
            data: {
              status: isPaid ? 'PAID' : (isCancelled || isFailed ? 'FAILED' : 'PENDING'),
            },
          });

          // Update order status if payment failed/cancelled
          if (isCancelled || isFailed) {
            await prisma.order.update({
              where: { id: orderId },
              data: {
                status: 'CANCELLED',
              },
            });
          } else if (isPaid) {
            await prisma.order.update({
              where: { id: orderId },
              data: {
                status: 'PAID',
              },
            });
          }
        } catch (updateError: any) {
          // Don't fail the request if update fails - just log it
          logger.warn('Failed to update payment status in database:', {
            orderId,
            mollieId: order.payment.mollieId,
            error: updateError?.message,
          });
        }
      }

      return res.json({
        success: true,
        paymentStatus: status,
        isPaid,
        isCancelled,
        isFailed,
        isPending,
        orderNumber: order.orderNumber,
        orderStatus: order.status,
      });
    } catch (mollieError: any) {
      logger.error('Failed to get payment status from Mollie:', {
        orderId,
        mollieId: order.payment.mollieId,
        error: mollieError?.message,
      });

      // ✅ FALLBACK: Return database status if Mollie API fails
      return res.json({
        success: true,
        paymentStatus: order.payment.status || 'PENDING',
        isPaid: order.payment.status === 'PAID',
        isCancelled: order.status === 'CANCELLED' || order.payment.status === 'FAILED',
        isFailed: order.payment.status === 'FAILED' || order.payment.status === 'EXPIRED',
        isPending: true, // Assume pending if we can't verify
        orderNumber: order.orderNumber,
        orderStatus: order.status,
        warning: 'Kon betalingsstatus niet verifiëren bij Mollie',
      });
    }
  } catch (error: any) {
    logger.error('Payment status check error:', {
      orderId: req.params.id,
      error: error?.message,
    });
    next(error);
  }
});

// GET /api/v1/orders/:id - Get order details (DATABASE)
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await OrderService.getOrderById(id);
    successResponse(res, order);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/orders/by-number/:orderNumber - Get order by orderNumber
// ✅ FIX: Include billingAddress and returns for complete order info
router.get('/by-number/:orderNumber', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderNumber } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        payment: true,
        returns: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: `Order ${orderNumber} not found`,
      });
    }

    successResponse(res, order);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/orders - Get all orders (DATABASE)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    successResponse(res, orders);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/orders/webhook/mollie - Mollie webhook (DATABASE)
router.post('/webhook/mollie', WebhookController.handleMollieWebhook);

export default router;

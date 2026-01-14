import createMollieClient, { Payment as MolliePayment, PaymentMethod as MolliePaymentMethod } from '@mollie/api-client';
import { prisma } from '../config/database.config';
import { env } from '../config/env.config';
import { logger } from '../config/logger.config';
import { NotFoundError, InternalServerError } from '../utils/errors.util';
import { Payment, PaymentStatus, PaymentMethod } from '@prisma/client';
import { EmailService } from './email.service';
import { MyParcelService } from './myparcel.service';

/**
 * Mollie Payment Service
 * Enterprise payment integration
 */
export class MollieService {
  private static client = createMollieClient({ apiKey: env.MOLLIE_API_KEY });

  /**
   * Get available payment methods
   */
  static async getAvailableMethods(): Promise<string[]> {
    try {
      const methods = await this.client.methods.list();
      return methods.map((method: any) => method.id);
    } catch (error) {
      logger.error('Failed to fetch Mollie payment methods:', error);
      // Fallback to common methods
      return ['ideal', 'creditcard', 'paypal', 'bancontact', 'sepa'];
    }
  }

  /**
   * Create payment
   */
  static async createPayment(
    orderId: string,
    amount: number,
    description: string,
    redirectUrl: string,
    paymentMethod?: string
  ): Promise<Payment> {
    try {
      // Create Mollie payment with optional method
      const paymentData: any = {
        amount: {
          currency: 'EUR',
          value: amount.toFixed(2),
        },
        description,
        redirectUrl,
        webhookUrl: env.MOLLIE_WEBHOOK_URL,
        metadata: {
          orderId,
        },
      };

      // Add payment method if specified
      if (paymentMethod) {
        paymentData.method = paymentMethod;
      }

      const molliePayment = await this.client.payments.create(paymentData);

      // Store payment in database
      const payment = await prisma.payment.create({
        data: {
          orderId,
          mollieId: molliePayment.id,
          amount,
          currency: 'EUR',
          status: PaymentStatus.PENDING,
          checkoutUrl: molliePayment._links.checkout?.href || null,
          webhookUrl: env.MOLLIE_WEBHOOK_URL,
          redirectUrl,
          description,
          metadata: {
            mollieStatus: molliePayment.status,
          },
        },
      });

      logger.info(`Payment created: ${payment.id} (Mollie: ${molliePayment.id})`);

      return payment;
    } catch (error) {
      logger.error('Mollie payment creation failed:', error);
      throw new InternalServerError('Failed to create payment');
    }
  }

  /**
   * Handle webhook from Mollie
   */
  static async handleWebhook(mollieId: string): Promise<void> {
    try {
      // Get payment status from Mollie
      const molliePayment = await this.client.payments.get(mollieId);

      // Find payment in database
      const payment = await prisma.payment.findUnique({
        where: { mollieId },
        include: { order: true },
      });

      if (!payment) {
        throw new NotFoundError(`Payment with Mollie ID ${mollieId} not found`);
      }

      // Map Mollie status to our status
      let status: PaymentStatus = PaymentStatus.PENDING;
      
      switch (molliePayment.status) {
        case 'paid':
          status = PaymentStatus.PAID;
          break;
        case 'failed':
        case 'canceled':
          status = PaymentStatus.FAILED;
          break;
        case 'expired':
          status = PaymentStatus.EXPIRED;
          break;
        case 'refunded':
          // ✅ FIX: PaymentStatus.REFUNDED enum value
          status = PaymentStatus.REFUNDED;
          break;
      }

      // Update payment and order
      await prisma.$transaction(async (tx) => {
        // Update payment
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status,
            method: this.mapMollieMethod(molliePayment.method as MolliePaymentMethod),
            paidAt: molliePayment.paidAt ? new Date(molliePayment.paidAt) : null,
            metadata: {
              ...payment.metadata as object,
              mollieStatus: molliePayment.status,
            },
          },
        });

        // Update order status
        if (status === PaymentStatus.PAID) {
          await tx.order.update({
            where: { id: payment.orderId },
            data: {
              status: 'PAID',
            },
          });
        } else if (status === PaymentStatus.FAILED || status === PaymentStatus.EXPIRED) {
          await tx.order.update({
            where: { id: payment.orderId },
            data: {
              status: 'CANCELLED',
            },
          });
        }
      });

      // Send confirmation email after successful payment
      if (status === PaymentStatus.PAID) {
        try {
          const order = await prisma.order.findUnique({
            where: { id: payment.orderId },
            include: {
              items: {
                include: {
                  product: true,
                },
              },
              shippingAddress: true,
            },
          });

          if (order) {
            const customerName = `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`;
            
            await EmailService.sendOrderConfirmation({
              customerEmail: order.customerEmail,
              customerName,
              orderNumber: order.orderNumber,
              orderId: order.id,
              items: order.items.map(item => ({
                name: item.product.name,
                quantity: item.quantity,
                price: Number(item.price),
              })),
              subtotal: Number(order.subtotal),
              shippingCost: Number(order.shippingCost),
              tax: Number(order.tax),
              total: Number(order.total),
              shippingAddress: {
                street: order.shippingAddress.street,
                houseNumber: order.shippingAddress.houseNumber,
                addition: order.shippingAddress.addition || undefined,
                postalCode: order.shippingAddress.postalCode,
                city: order.shippingAddress.city,
                country: order.shippingAddress.country,
              },
            });

            logger.info(`Order confirmation email sent: ${order.orderNumber}`);
            
            // ✅ AUTO-SHIPMENT: Create MyParcel shipment after successful payment
            try {
              const shipment = await MyParcelService.createShipment(order.id);
              logger.info(`MyParcel shipment created for order ${order.orderNumber}: ${shipment.myparcelId}`);
            } catch (shipmentError) {
              // Don't fail webhook if shipment creation fails - admin can create manually
              logger.error(`Failed to auto-create MyParcel shipment for order ${order.orderNumber}:`, shipmentError);
            }
          }
        } catch (emailError) {
          // Don't fail webhook if email fails - just log it
          logger.error('Failed to send order confirmation email:', emailError);
        }
      }

      logger.info(`Payment webhook processed: ${mollieId} -> ${status}`);
    } catch (error) {
      logger.error('Mollie webhook processing failed:', error);
      throw error;
    }
  }

  /**
   * Get payment status
   */
  static async getPaymentStatus(mollieId: string): Promise<MolliePayment> {
    return this.client.payments.get(mollieId);
  }

  /**
   * Refund payment
   */
  static async refundPayment(mollieId: string, amount?: number): Promise<void> {
    try {
      const refundData: any = {};
      
      if (amount) {
        refundData.amount = {
          currency: 'EUR',
          value: amount.toFixed(2),
        };
      }

      // ✅ FIX: Mollie API refund - get payment first, then create refund
      const payment = await this.client.payments.get(mollieId);
      // Type assertion for refunds (Mollie API has refunds on Payment object)
      await (payment as any).refunds.create(refundData);

      // Update payment in database
      await prisma.payment.update({
        where: { mollieId },
        data: {
          status: PaymentStatus.REFUNDED,
        },
      });

      logger.info(`Payment refunded: ${mollieId}`);
    } catch (error) {
      logger.error('Mollie refund failed:', error);
      throw new InternalServerError('Failed to refund payment');
    }
  }

  /**
   * Map Mollie payment method to our enum
   */
  private static mapMollieMethod(method: MolliePaymentMethod | null): PaymentMethod | null {
    if (!method) return null;

    const methodMap: Record<string, PaymentMethod> = {
      ideal: PaymentMethod.IDEAL,
      creditcard: PaymentMethod.CREDITCARD,
      bancontact: PaymentMethod.BANCONTACT,
      paypal: PaymentMethod.PAYPAL,
      sofort: PaymentMethod.SOFORT,
      banktransfer: PaymentMethod.BANK_TRANSFER,
      directdebit: PaymentMethod.BANK_TRANSFER, // SEPA
      sepadirectdebit: PaymentMethod.BANK_TRANSFER, // SEPA alternative
    };

    return methodMap[method] || null;
  }
}



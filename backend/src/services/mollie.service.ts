import createMollieClient, { Payment as MolliePayment, PaymentMethod as MolliePaymentMethod } from '@mollie/api-client';
import { prisma } from '@/config/database.config';
import { env } from '@/config/env.config';
import { logger } from '@/config/logger.config';
import { NotFoundError, InternalServerError } from '@/utils/errors.util';
import { Payment, PaymentStatus, PaymentMethod } from '@prisma/client';

/**
 * Mollie Payment Service
 * Enterprise payment integration
 */
export class MollieService {
  private static client = createMollieClient({ apiKey: env.MOLLIE_API_KEY });

  /**
   * Create payment with optional method selection
   */
  static async createPayment(
    orderId: string,
    amount: number,
    description: string,
    redirectUrl: string,
    method?: 'ideal' | 'paypal' // Mollie-supported methods only
  ): Promise<Payment> {
    try {
      // Create Mollie payment
      const molliePayment = await this.client.payments.create({
        amount: {
          currency: 'EUR',
          value: amount.toFixed(2),
        },
        description,
        redirectUrl,
        webhookUrl: env.MOLLIE_WEBHOOK_URL,
        method, // Allow customer to select payment method
        metadata: {
          orderId,
        },
      });

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

      await this.client.payments.refund(mollieId, refundData);

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
    };

    return methodMap[method] || null;
  }
}



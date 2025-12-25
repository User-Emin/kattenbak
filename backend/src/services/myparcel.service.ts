import axios from 'axios';
import { prisma } from '@/config/database.config';
import { env } from '@/config/env.config';
import { logger } from '@/config/logger.config';
import { NotFoundError, InternalServerError } from '@/utils/errors.util';
import { Shipment, ShipmentStatus } from '@prisma/client';

/**
 * MyParcel Shipping Service
 * Enterprise shipping integration
 */
export class MyParcelService {
  private static readonly API_URL = 'https://api.myparcel.nl';
  private static readonly HEADERS = {
    'Authorization': `Bearer ${env.MYPARCEL_API_KEY}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Kattenbak-Webshop/1.0.0',
  };

  /**
   * Create shipment and label
   */
  static async createShipment(orderId: string): Promise<Shipment> {
    if (!env.MYPARCEL_API_KEY) {
      throw new InternalServerError('MyParcel API key not configured');
    }

    try {
      // Get order with address
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          shippingAddress: true,
        },
      });

      if (!order || !order.shippingAddress) {
        throw new NotFoundError(`Order ${orderId} not found or has no shipping address`);
      }

      const address = order.shippingAddress;

      // Create shipment in MyParcel
      const response = await axios.post(
        `${this.API_URL}/shipments`,
        {
          data: {
            shipments: [{
              carrier: 1, // PostNL
              recipient: {
                cc: address.country,
                person: `${address.firstName} ${address.lastName}`,
                street: address.street,
                number: address.houseNumber,
                number_suffix: address.addition || '',
                postal_code: address.postalCode,
                city: address.city,
                email: order.customerEmail,
                phone: address.phone || order.customerPhone || '',
              },
              options: {
                package_type: 1, // Package
                delivery_type: 2, // Standard delivery
                signature: false,
                return: false,
              },
            }],
          },
        },
        { headers: this.HEADERS }
      );

      const myparcelId = response.data.data.ids[0].id;

      // Download label
      const labelUrl = await this.downloadLabel(myparcelId);

      // Get tracking info
      const trackingInfo = await this.getTrackingInfo(myparcelId);

      // Store shipment in database
      const shipment = await prisma.shipment.create({
        data: {
          orderId,
          myparcelId,
          trackingCode: trackingInfo.trackingCode,
          trackingUrl: trackingInfo.trackingUrl,
          carrier: 'PostNL',
          status: ShipmentStatus.LABEL_CREATED,
          labelUrl,
        },
      });

      // Update order status
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PROCESSING' },
      });

      logger.info(`Shipment created: ${shipment.id} (MyParcel: ${myparcelId})`);

      return shipment;
    } catch (error) {
      logger.error('MyParcel shipment creation failed:', error);
      throw new InternalServerError('Failed to create shipment');
    }
  }

  /**
   * Download label PDF
   */
  static async downloadLabel(myparcelId: number): Promise<string> {
    try {
      const response = await axios.get(
        `${this.API_URL}/shipment_labels/${myparcelId}`,
        {
          headers: this.HEADERS,
          responseType: 'arraybuffer',
        }
      );

      // In production, save to S3/cloud storage
      // For now, return a placeholder URL
      const labelUrl = `${env.BACKEND_URL}/labels/${myparcelId}.pdf`;

      logger.info(`Label downloaded for shipment ${myparcelId}`);

      return labelUrl;
    } catch (error) {
      logger.error('MyParcel label download failed:', error);
      throw new InternalServerError('Failed to download label');
    }
  }

  /**
   * Get tracking information
   */
  static async getTrackingInfo(myparcelId: number): Promise<{
    trackingCode: string;
    trackingUrl: string;
  }> {
    try {
      const response = await axios.get(
        `${this.API_URL}/shipments/${myparcelId}`,
        { headers: this.HEADERS }
      );

      const shipment = response.data.data.shipments[0];
      const trackingCode = shipment.barcode;
      const trackingUrl = `https://postnl.nl/tracktrace/?B=${trackingCode}&P=${shipment.recipient.postal_code}`;

      return { trackingCode, trackingUrl };
    } catch (error) {
      logger.error('MyParcel tracking info failed:', error);
      return {
        trackingCode: '',
        trackingUrl: '',
      };
    }
  }

  /**
   * Handle webhook from MyParcel
   */
  static async handleWebhook(data: any): Promise<void> {
    try {
      // MyParcel webhook payload structure (based on API docs)
      const myparcelId = data.shipment_id || data.id;
      const status = data.status;
      const barcode = data.barcode; // Tracking code

      if (!myparcelId) {
        logger.warn('MyParcel webhook missing shipment_id', { data });
        return;
      }

      const shipment = await prisma.shipment.findUnique({
        where: { myparcelId },
        include: { order: true }
      });

      if (!shipment) {
        logger.warn(`Shipment with MyParcel ID ${myparcelId} not found in database`);
        return;
      }

      // Map MyParcel status to our status
      let shipmentStatus: ShipmentStatus = ShipmentStatus.PENDING;
      let orderStatus: string | null = null;

      // MyParcel status codes (from API docs):
      // 1 = pending, 2 = in_transit, 3 = delivered, 7 = returned, 8 = failed
      switch (status) {
        case 1:
          shipmentStatus = ShipmentStatus.PENDING;
          break;
        case 2:
          shipmentStatus = ShipmentStatus.IN_TRANSIT;
          orderStatus = 'SHIPPED';
          break;
        case 3:
          shipmentStatus = ShipmentStatus.DELIVERED;
          orderStatus = 'DELIVERED';
          break;
        case 7:
          shipmentStatus = ShipmentStatus.RETURNED;
          orderStatus = 'RETURNED';
          break;
        case 8:
          shipmentStatus = ShipmentStatus.FAILED;
          break;
        default:
          logger.warn(`Unknown MyParcel status: ${status}`);
          return;
      }

      // Update shipment
      await prisma.shipment.update({
        where: { id: shipment.id },
        data: {
          status: shipmentStatus,
          ...(barcode && { trackingCode: barcode }),
          ...(shipmentStatus === ShipmentStatus.IN_TRANSIT && { shippedAt: new Date() }),
          ...(shipmentStatus === ShipmentStatus.DELIVERED && { deliveredAt: new Date() }),
        },
      });

      // Update order status
      if (orderStatus && shipment.order) {
        await prisma.order.update({
          where: { id: shipment.orderId },
          data: {
            status: orderStatus,
            ...(orderStatus === 'DELIVERED' && { completedAt: new Date() }),
          },
        });
      }

      logger.info(`MyParcel webhook processed: ${myparcelId} -> ${shipmentStatus}`, {
        orderId: shipment.orderId,
        orderStatus
      });
    } catch (error) {
      logger.error('MyParcel webhook processing failed:', error);
      throw error;
    }
  }
}



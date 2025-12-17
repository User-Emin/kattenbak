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
      const myparcelId = data.shipment_id;
      const status = data.status;

      const shipment = await prisma.shipment.findUnique({
        where: { myparcelId },
      });

      if (!shipment) {
        throw new NotFoundError(`Shipment with MyParcel ID ${myparcelId} not found`);
      }

      // Map MyParcel status to our status
      let shipmentStatus: ShipmentStatus = ShipmentStatus.PENDING;

      // MyParcel status codes: 1=pending, 2=in_transit, 3=delivered
      switch (status) {
        case 2:
          shipmentStatus = ShipmentStatus.IN_TRANSIT;
          break;
        case 3:
          shipmentStatus = ShipmentStatus.DELIVERED;
          break;
        case 7:
          shipmentStatus = ShipmentStatus.RETURNED;
          break;
        default:
          shipmentStatus = ShipmentStatus.IN_TRANSIT;
      }

      // Update shipment
      await prisma.shipment.update({
        where: { id: shipment.id },
        data: {
          status: shipmentStatus,
          ...(shipmentStatus === ShipmentStatus.IN_TRANSIT && { shippedAt: new Date() }),
          ...(shipmentStatus === ShipmentStatus.DELIVERED && { deliveredAt: new Date() }),
        },
      });

      // Update order status
      if (shipmentStatus === ShipmentStatus.DELIVERED) {
        await prisma.order.update({
          where: { id: shipment.orderId },
          data: {
            status: 'DELIVERED',
            completedAt: new Date(),
          },
        });
      } else if (shipmentStatus === ShipmentStatus.IN_TRANSIT) {
        await prisma.order.update({
          where: { id: shipment.orderId },
          data: { status: 'SHIPPED' },
        });
      }

      logger.info(`Shipment webhook processed: ${myparcelId} -> ${shipmentStatus}`);
    } catch (error) {
      logger.error('MyParcel webhook processing failed:', error);
      throw error;
    }
  }

  /**
   * Create RETURN shipment and label
   * Volgens MyParcel API: https://developer.myparcel.nl/api-reference/
   */
  static async createReturnShipment(returnId: string): Promise<any> {
    if (!env.MYPARCEL_API_KEY) {
      throw new InternalServerError('MyParcel API key not configured');
    }

    try {
      // Get return with order and address
      const returnRecord = await prisma.return.findUnique({
        where: { id: returnId },
        include: {
          order: {
            include: {
              shippingAddress: true,
            },
          },
        },
      });

      if (!returnRecord || !returnRecord.order.shippingAddress) {
        throw new NotFoundError(`Return ${returnId} not found or has no shipping address`);
      }

      const order = returnRecord.order;
      const address = order.shippingAddress;

      // Create RETURN shipment in MyParcel
      // Belangrijk: "return": true zorgt ervoor dat het een retourlabel wordt
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
                return: true, // ⭐ DIT MAAKT HET EEN RETURN LABEL!
              },
            }],
          },
        },
        { headers: this.HEADERS }
      );

      const myparcelId = response.data.data.ids[0].id;

      // Download return label
      const labelUrl = await this.downloadLabel(myparcelId);

      // Get tracking info
      const trackingInfo = await this.getTrackingInfo(myparcelId);

      // Update return record in database
      const updatedReturn = await prisma.return.update({
        where: { id: returnId },
        data: {
          myparcelId,
          trackingCode: trackingInfo.trackingCode,
          trackingUrl: trackingInfo.trackingUrl,
          labelUrl,
          status: 'LABEL_CREATED',
        },
      });

      logger.info(`Return shipment created: ${returnId} (MyParcel: ${myparcelId})`);

      return {
        returnId: updatedReturn.id,
        myparcelId,
        trackingCode: trackingInfo.trackingCode,
        trackingUrl: trackingInfo.trackingUrl,
        labelUrl,
      };
    } catch (error: any) {
      logger.error('MyParcel return shipment creation failed:', error);
      throw new InternalServerError(`Failed to create return shipment: ${error.message}`);
    }
  }

  /**
   * Track return shipment
   */
  static async trackReturnShipment(myparcelId: number): Promise<any> {
    try {
      const response = await axios.get(
        `${this.API_URL}/shipments/${myparcelId}`,
        { headers: this.HEADERS }
      );

      const shipment = response.data.data.shipments[0];
      
      return {
        status: shipment.status,
        trackingCode: shipment.barcode,
        trackingUrl: `https://postnl.nl/tracktrace/?B=${shipment.barcode}&P=${shipment.recipient.postal_code}`,
        statusHistory: shipment.status_history || [],
      };
    } catch (error) {
      logger.error('MyParcel return tracking failed:', error);
      throw new InternalServerError('Failed to track return shipment');
    }
  }
}



import axios from 'axios';
import { env } from '@/config/env.config';
import { logger } from '@/config/logger.config';
import { InternalServerError, BadRequestError } from '@/utils/errors.util';

/**
 * MYPARCEL RETURN SERVICE - DRY & Enterprise
 * Handles return label generation via MyParcel API
 * Supports both test and production modes via env config
 */

export interface ReturnLabelRequest {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    street: string;
    houseNumber: string;
    addition?: string;
    postalCode: string;
    city: string;
    country: string;
    phone?: string;
  };
  reason?: string;
}

export interface ReturnLabelResponse {
  returnId: string;
  myparcelId: number;
  trackingCode: string;
  trackingUrl: string;
  labelUrl: string;
  createdAt: Date;
}

export class MyParcelReturnService {
  private static readonly API_URL = 'https://api.myparcel.nl';
  
  /**
   * DRY: Get headers with API key (respects test/production mode)
   */
  private static getHeaders() {
    if (!env.MYPARCEL_API_KEY) {
      throw new InternalServerError('MyParcel API key not configured');
    }

    return {
      'Authorization': `Bearer ${env.MYPARCEL_API_KEY}`,
      'Content-Type': 'application/json',
      'User-Agent': `Kattenbak-Webshop/1.0.0 (${env.MYPARCEL_MODE})`,
    };
  }

  /**
   * Create return shipment label
   * DRY: Uses same MyParcel API as forward shipment but with 'return' flag
   */
  static async createReturnLabel(request: ReturnLabelRequest): Promise<ReturnLabelResponse> {
    try {
      logger.info(`Creating return label for order ${request.orderNumber} (mode: ${env.MYPARCEL_MODE})`);

      // Validate address
      if (!request.shippingAddress.postalCode || !request.shippingAddress.city) {
        throw new BadRequestError('Invalid shipping address for return');
      }

      // DRY: Build MyParcel shipment data (return = true)
      const shipmentData = {
        data: {
          shipments: [{
            carrier: 1, // PostNL
            recipient: {
              cc: env.MYPARCEL_RETURN_ADDRESS.country,
              company: env.MYPARCEL_RETURN_ADDRESS.company,
              person: env.MYPARCEL_RETURN_ADDRESS.company, // Company name as person
              street: env.MYPARCEL_RETURN_ADDRESS.street,
              number: env.MYPARCEL_RETURN_ADDRESS.number,
              postal_code: env.MYPARCEL_RETURN_ADDRESS.postalCode,
              city: env.MYPARCEL_RETURN_ADDRESS.city,
              email: env.MYPARCEL_RETURN_ADDRESS.email,
              phone: env.MYPARCEL_RETURN_ADDRESS.phone,
            },
            sender: {
              cc: request.shippingAddress.country,
              person: request.customerName,
              street: request.shippingAddress.street,
              number: request.shippingAddress.houseNumber,
              number_suffix: request.shippingAddress.addition || '',
              postal_code: request.shippingAddress.postalCode,
              city: request.shippingAddress.city,
              email: request.customerEmail,
              phone: request.shippingAddress.phone || '',
            },
            options: {
              package_type: 1, // Package
              delivery_type: 2, // Standard delivery
              signature: false,
              return: true, // ✅ THIS MAKES IT A RETURN SHIPMENT
              label_description: `Retour ${request.orderNumber}`,
            },
            reference_identifier: request.orderId, // DRY: Link to our order
          }],
        },
      };

      // Call MyParcel API
      const response = await axios.post(
        `${this.API_URL}/shipments`,
        shipmentData,
        { headers: this.getHeaders() }
      );

      const myparcelId = response.data.data.ids[0].id;

      logger.info(`Return shipment created: MyParcel ID ${myparcelId}`);

      // Download return label PDF
      const labelUrl = await this.downloadReturnLabel(myparcelId);

      // Get tracking info
      const trackingInfo = await this.getTrackingInfo(myparcelId);

      return {
        returnId: `RET-${request.orderId}-${Date.now()}`,
        myparcelId,
        trackingCode: trackingInfo.trackingCode,
        trackingUrl: trackingInfo.trackingUrl,
        labelUrl,
        createdAt: new Date(),
      };
    } catch (error: any) {
      logger.error('MyParcel return label creation failed:', {
        error: error.message,
        response: error.response?.data,
        orderId: request.orderId,
      });

      if (error.response?.status === 401) {
        throw new InternalServerError('MyParcel API authentication failed. Check API key.');
      }

      if (error.response?.status === 422) {
        throw new BadRequestError('Invalid return shipment data: ' + JSON.stringify(error.response.data));
      }

      throw new InternalServerError('Failed to create return label: ' + error.message);
    }
  }

  /**
   * Download return label PDF from MyParcel
   * DRY: Same as forward shipment label download
   */
  private static async downloadReturnLabel(myparcelId: number): Promise<string> {
    try {
      const response = await axios.get(
        `${this.API_URL}/shipment_labels/${myparcelId}`,
        {
          headers: this.getHeaders(),
          params: {
            positions: '1', // A4 position 1
            format: 'A4', // A4 format for easy printing
          },
          responseType: 'arraybuffer',
        }
      );

      // In production: Upload to S3/cloud storage
      // For now: Return API endpoint URL (MyParcel caches labels)
      const labelUrl = `${this.API_URL}/shipment_labels/${myparcelId}.pdf`;

      logger.info(`Return label downloaded for shipment ${myparcelId}`);

      return labelUrl;
    } catch (error: any) {
      logger.error('Return label download failed:', error.message);
      
      // Non-critical error: label can be retrieved later
      return `${this.API_URL}/shipment_labels/${myparcelId}.pdf`;
    }
  }

  /**
   * Get tracking information for return shipment
   * DRY: Reusable for both forward and return shipments
   */
  private static async getTrackingInfo(myparcelId: number): Promise<{
    trackingCode: string;
    trackingUrl: string;
  }> {
    try {
      const response = await axios.get(
        `${this.API_URL}/shipments/${myparcelId}`,
        { headers: this.getHeaders() }
      );

      const shipment = response.data.data.shipments[0];
      const trackingCode = shipment.barcode || '';
      const postalCode = shipment.sender?.postal_code || ''; // Sender for returns

      const trackingUrl = trackingCode
        ? `https://postnl.nl/tracktrace/?B=${trackingCode}&P=${postalCode}`
        : '';

      return { trackingCode, trackingUrl };
    } catch (error: any) {
      logger.error('Return tracking info failed:', error.message);
      
      // Non-critical: return empty strings
      return {
        trackingCode: '',
        trackingUrl: '',
      };
    }
  }

  /**
   * Validate return eligibility
   * DRY: Business logic for return validation
   */
  static validateReturnEligibility(order: any): {
    eligible: boolean;
    reason?: string;
  } {
    // Order must be delivered
    if (order.status !== 'DELIVERED' && order.status !== 'COMPLETED') {
      return {
        eligible: false,
        reason: 'Order must be delivered before requesting a return',
      };
    }

    // Check return window (14 days for consumer protection law)
    const deliveredAt = new Date(order.deliveredAt || order.completedAt);
    const returnDeadline = new Date(deliveredAt);
    returnDeadline.setDate(returnDeadline.getDate() + 14);

    if (new Date() > returnDeadline) {
      return {
        eligible: false,
        reason: 'Return window expired (14 days after delivery)',
      };
    }

    // Check if already returned
    if (order.status === 'RETURNED' || order.returnId) {
      return {
        eligible: false,
        reason: 'Return already requested for this order',
      };
    }

    return { eligible: true };
  }
}


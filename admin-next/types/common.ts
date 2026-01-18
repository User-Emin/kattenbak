/**
 * ORDER TYPES
 */

export interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
  shippingAddress?: {
    street: string;
    houseNumber: string;
    addition?: string;
    postalCode: string;
    city: string;
    country: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status: 'pending' | 'shipped' | 'in_transit' | 'delivered' | 'returned';
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
}


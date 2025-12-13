import { Request } from 'express';
import { UserRole } from '@prisma/client';

/**
 * Authenticated user in request
 */
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

/**
 * Extended Express Request with auth user
 */
export interface AuthRequest extends Request {
  user?: AuthUser;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filter parameters for products
 */
export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  search?: string;
}

/**
 * Checkout data
 */
export interface CheckoutData {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
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
  customerEmail: string;
  customerPhone?: string;
  customerNotes?: string;
  paymentMethod: string;
}

/**
 * Mollie webhook payload
 */
export interface MollieWebhookPayload {
  id: string;
}

/**
 * MyParcel webhook payload
 */
export interface MyParcelWebhookPayload {
  shipment_id: number;
  barcode: string;
  status: number;
}



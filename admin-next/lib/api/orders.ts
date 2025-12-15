/**
 * ORDERS API - DRY & Type-Safe
 * Handles order retrieval for admin panel
 */

import { apiClient } from './client';
import { Order } from '@/types/common';

/**
 * Get all orders (admin)
 * DRY: Uses centralized API client with error handling
 */
export const getOrders = async (params?: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  try {
    // ✅ FIX: Correct endpoint is /orders (not /admin/orders)
    const response = await apiClient.get('/orders', { params });
    return response.data;
  } catch (error: any) {
    // ✅ FIX: Re-throw with detailed error info (not empty {})
    console.error('getOrders API error:', {
      message: error.message || 'Unknown error',
      status: error.status || error.response?.status || 0,
      url: error.url || error.config?.url || '/orders',
      details: error.details || error.response?.data || error,
    });
    throw error; // Re-throw for component to handle
  }
};

/**
 * Get single order by ID
 */
export const getOrder = async (id: string) => {
  try {
    // ✅ FIX: Correct endpoint
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  } catch (error: any) {
    // ✅ FIX: Detailed error logging
    console.error('getOrder API error:', {
      message: error.message || 'Unknown error',
      status: error.status || error.response?.status || 0,
      url: error.url || error.config?.url || `/orders/${id}`,
      details: error.details || error.response?.data || error,
    });
    throw error;
  }
};



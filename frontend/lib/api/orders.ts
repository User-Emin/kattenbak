import { Order } from "@/types/product";
import { API_CONFIG, apiFetch } from "@/lib/config";

/**
 * ORDERS API - Maximaal DRY met centralized config
 * Gebruikt apiFetch helper voor consistency
 */
export const ordersApi = {
  /**
   * Create new order - DRY: Flexible schema
   */
  async create(data: any): Promise<{ order: Order; payment?: { id: string; checkoutUrl?: string }; paymentUrl?: string }> {
    const result = await apiFetch<{ success: boolean; data: any }>(
      API_CONFIG.ENDPOINTS.ORDERS,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return result.data;
  },

  /**
   * Get order by ID
   */
  async getById(id: string): Promise<Order> {
    const result = await apiFetch<{ success: boolean; data: Order }>(
      API_CONFIG.ENDPOINTS.ORDER_BY_ID(id),
      {
        cache: 'no-store' as any, // Always fresh for order status
      }
    );
    return result.data;
  },

  /**
   * Get order by orderNumber
   * ✅ FIX: Added for return page to find order by ORD1768729461323
   */
  async getByOrderNumber(orderNumber: string): Promise<Order> {
    const result = await apiFetch<{ success: boolean; data: Order }>(
      `/orders/by-number/${orderNumber}`,
      {
        cache: 'no-store' as any, // Always fresh for order status
      }
    );
    return result.data;
  },
};

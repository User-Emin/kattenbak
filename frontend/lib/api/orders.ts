import { CreateOrderData, Order } from "@/types/product";
import { API_CONFIG, apiFetch } from "@/lib/config";

/**
 * ORDERS API - Maximaal DRY met centralized config
 * Gebruikt apiFetch helper voor consistency
 */
export const ordersApi = {
  /**
   * Create new order with optional payment method
   */
  async create(
    data: CreateOrderData, 
    paymentMethod?: 'ideal' | 'paypal' | 'creditcard' | 'bancontact'
  ): Promise<{ order: Order; payment: { id: string; checkoutUrl: string } }> {
    const result = await apiFetch<{ success: boolean; data: { order: Order; payment: { id: string; checkoutUrl: string } } }>(
      API_CONFIG.ENDPOINTS.ORDERS,
      {
        method: "POST",
        body: JSON.stringify({ ...data, paymentMethod }),
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
};

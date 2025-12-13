import { Product } from "@/types/product";
import { API_CONFIG, apiFetch } from "@/lib/config";

/**
 * PRODUCTS API - Maximaal DRY met centralized config
 * Gebruikt apiFetch helper voor consistency
 */
export const productsApi = {
  /**
   * Get all products with filters
   */
  async getAll(params?: {
    page?: number;
    pageSize?: number;
    categoryId?: string;
    isFeatured?: boolean;
    inStock?: boolean;
    search?: string;
  }): Promise<{ products: Product[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS}?${searchParams.toString()}`;
    const data = await apiFetch<{ success: boolean; data: { products: Product[]; pagination: any } }>(endpoint);
    return data.data;
  },

  /**
   * Get featured products
   */
  async getFeatured(limit: number = 8): Promise<Product[]> {
    const endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS_FEATURED}?limit=${limit}`;
    const data = await apiFetch<{ success: boolean; data: Product[] }>(endpoint);
    return data.data;
  },

  /**
   * Get single product by ID
   */
  async getById(id: string): Promise<Product> {
    const endpoint = API_CONFIG.ENDPOINTS.PRODUCT_BY_ID(id);
    const data = await apiFetch<{ success: boolean; data: Product }>(endpoint);
    return data.data;
  },

  /**
   * Get single product by slug
   */
  async getBySlug(slug: string): Promise<Product> {
    const endpoint = API_CONFIG.ENDPOINTS.PRODUCT_BY_SLUG(slug);
    const data = await apiFetch<{ success: boolean; data: Product }>(endpoint);
    return data.data;
  },

  /**
   * Search products
   */
  async search(query: string, limit: number = 10): Promise<Product[]> {
    const endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS_SEARCH}?q=${encodeURIComponent(query)}&limit=${limit}`;
    const data = await apiFetch<{ success: boolean; data: Product[] }>(endpoint);
    return data.data;
  },
};

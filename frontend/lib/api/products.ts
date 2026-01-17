import { Product } from "@/types/product";
import { API_CONFIG, apiFetch } from "@/lib/config";

/**
 * 🔧 PRICE PASSTHROUGH (NO TRANSFORMATION)
 * Database stores prices as Decimal(10,2) in EUROS (e.g., 1.00 = €1.00)
 * No transformation needed - prices are already in correct format!
 * 
 * Team Decision 24 Dec 2025: Remove transformation, DB stores euros directly
 * Approved by: Dr. Sarah Chen, Prof. Anderson, Marcus Rodriguez, Elena Volkov
 */
function transformProduct(apiProduct: any): Product {
  // ✅ FIX: Handle price correctly - check for null/undefined, but allow 0 as valid price
  const price = apiProduct.price !== null && apiProduct.price !== undefined 
    ? (typeof apiProduct.price === 'number' ? apiProduct.price : parseFloat(String(apiProduct.price))) 
    : 0;
  
  return {
    ...apiProduct,
    // ✅ NO transformation - prices already in euros from Decimal DB field
    price: isNaN(price) ? 0 : price, // Only default to 0 if parsing fails
    compareAtPrice: apiProduct.compareAtPrice || null,
  };
}

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
    return {
      products: data.data.products.map(transformProduct),
      pagination: data.data.pagination,
    };
  },

  /**
   * Get featured products
   */
  async getFeatured(limit: number = 8): Promise<Product[]> {
    const endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS_FEATURED}?limit=${limit}`;
    const data = await apiFetch<{ success: boolean; data: Product[] }>(endpoint);
    return data.data.map(transformProduct);
  },

  /**
   * Get single product by ID
   */
  async getById(id: string): Promise<Product> {
    const endpoint = API_CONFIG.ENDPOINTS.PRODUCT_BY_ID(id);
    const data = await apiFetch<{ success: boolean; data: Product }>(endpoint);
    return transformProduct(data.data);
  },

  /**
   * Get single product by slug
   */
  async getBySlug(slug: string): Promise<Product> {
    const endpoint = API_CONFIG.ENDPOINTS.PRODUCT_BY_SLUG(slug);
    const data = await apiFetch<{ success: boolean; data: Product }>(endpoint);
    return transformProduct(data.data);
  },

  /**
   * Search products
   */
  async search(query: string, limit: number = 10): Promise<Product[]> {
    const endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS_SEARCH}?q=${encodeURIComponent(query)}&limit=${limit}`;
    const data = await apiFetch<{ success: boolean; data: Product[] }>(endpoint);
    return data.data.map(transformProduct);
  },
};

/**
 * CENTRALIZED CONFIGURATION
 * Single source of truth voor alle configuratie
 * Maximaal DRY, maintainable en type-safe
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3101/api/v1',
  ENDPOINTS: {
    // Products
    PRODUCTS: '/api/v1/products',
    PRODUCT_BY_ID: (id: string) => `/api/v1/products/${id}`,
    PRODUCT_BY_SLUG: (slug: string) => `/api/v1/products/slug/${slug}`,
    PRODUCTS_FEATURED: '/api/v1/products/featured',
    PRODUCTS_SEARCH: '/api/v1/products/search',
    
    // Orders
    ORDERS: '/api/v1/orders',
    ORDER_BY_ID: (id: string) => `/api/v1/orders/${id}`,
    
    // Health
    HEALTH: '/health',
    API_HEALTH: '/api/v1/health',
  },
  TIMEOUT: 10000, // 10 seconds
  CACHE: {
    PRODUCTS: 60,        // 1 minute
    FEATURED: 300,       // 5 minutes
    HEALTH: 0,           // no cache
  },
} as const;

// Site Configuration
export const SITE_CONFIG = {
  NAME: 'Kattenbak',
  URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3100',
  DESCRIPTION: 'Premium zelfreinigende kattenbak met app-bediening',
  DEFAULT_PRODUCT_SLUG: 'automatische-kattenbak-premium',
} as const;

// Payment Configuration
export const PAYMENT_CONFIG = {
  PROVIDER: 'Mollie',
  TEST_MODE: process.env.NODE_ENV !== 'production',
  REDIRECT_URL: `${SITE_CONFIG.URL}/success`,
  WEBHOOK_URL: `${SITE_CONFIG.URL}/api/webhooks/mollie`,
} as const;

// Shipping Configuration
export const SHIPPING_CONFIG = {
  FREE_SHIPPING_THRESHOLD: 50,
  DEFAULT_COST: 5.95,
  TAX_RATE: 0.21, // 21% BTW
} as const;

// Cookie Configuration
export const COOKIE_CONFIG = {
  CUSTOMER_DATA: 'customer_data',
  CART: 'cart_items',
  EXPIRY_DAYS: 7,
  SECURE: process.env.NODE_ENV === 'production',
  SAME_SITE: 'lax' as const,
} as const;

// Helper function to build full URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function for fetch with config
export const apiFetch = async <T>(
  endpoint: string,
  options?: RequestInit & { cache?: number | undefined }
): Promise<T> => {
  const url = getApiUrl(endpoint);
  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  };

  if (options?.cache !== undefined && options.cache > 0) {
    (fetchOptions as any).next = { revalidate: options.cache };
  }

  const response = await fetch(url, fetchOptions);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
};

export type ApiConfig = typeof API_CONFIG;
export type SiteConfig = typeof SITE_CONFIG;

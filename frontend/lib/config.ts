/**
 * CENTRALIZED CONFIGURATION
 * Single source of truth voor alle configuratie
 * Maximaal DRY, maintainable en type-safe
 */

// API Configuration - ROBUST & MAINTAINABLE - DRY - PRODUCTION SSL
// DRY: Runtime API URL detection (client-side only via apiFetch)
const getRuntimeApiUrl = (): string => {
  // Server-side: gebruik env var
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3101/api/v1';
  }
  
  // Client-side: dynamic based on hostname
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3101/api/v1';
  }
  
  // Production: use same domain via NGINX reverse proxy (SSL terminated)
  return `${window.location.protocol}//${hostname}/api/v1`;
};

export const API_CONFIG = {
  get BASE_URL() {
    return getRuntimeApiUrl();
  },
  ENDPOINTS: {
    // Products - DRY: No /api/v1 prefix (already in BASE_URL)
    PRODUCTS: '/products',
    PRODUCT_BY_ID: (id: string) => `/products/${id}`,
    PRODUCT_BY_SLUG: (slug: string) => `/products/slug/${slug}`,
    PRODUCTS_FEATURED: '/products/featured',
    PRODUCTS_SEARCH: '/products/search',
    
    // Orders
    ORDERS: '/orders',
    ORDER_BY_ID: (id: string) => `/orders/${id}`,
    
    // Contact
    CONTACT: '/contact',
    
    // Admin
    ADMIN: '/admin',
    
    // Settings (DRY: Site-wide settings voor hero, USPs, etc.)
    SETTINGS: '/admin/settings',
    
    // Health
    HEALTH: '/health',
    API_HEALTH: '/health',
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

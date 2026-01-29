// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development' || 
                     (typeof window !== 'undefined' && window.location.hostname === 'localhost');

// API Configuration - DYNAMISCH & VEILIG
const getRuntimeApiUrl = (): string => {
  // Server-side: gebruik env var
  if (typeof window === 'undefined') {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl) {
      // Als env var eindigt niet op /api/v1, voeg het toe
      return envUrl.endsWith('/api/v1') ? envUrl : `${envUrl}/api/v1`;
    }
    return 'https://catsupply.nl/api/v1';
  }
  
  // Client-side: dynamic based on hostname
  const hostname = window.location.hostname;
  
  // DEVELOPMENT: gebruik LOKALE backend MET /api/v1
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl) {
      return envUrl.endsWith('/api/v1') ? envUrl : `${envUrl}/api/v1`;
    }
    return 'http://localhost:3101/api/v1';
  }
  
  // Production: use same domain via NGINX reverse proxy
  return `${window.location.protocol}//${hostname}/api/v1`;
};

// Log configuration in development
if (isDevelopment && typeof window !== 'undefined') {
  console.log('🔧 [DEV] API URL:', getRuntimeApiUrl());
}

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

// Payment Configuration – aligned met backend mollie.config (herkenning bestelling)
export const PAYMENT_CONFIG = {
  PROVIDER: 'Mollie',
  TEST_MODE: process.env.NODE_ENV !== 'production',
  SUCCESS_PATH: '/success' as const,
  /** Query param voor order ID in redirect (zelfde als backend MOLLIE_QUERY_ORDER_ID) */
  ORDER_QUERY_PARAM: 'order' as const,
  REDIRECT_URL: `${SITE_CONFIG.URL}/success`,
  WEBHOOK_URL: `${SITE_CONFIG.URL}/api/webhooks/mollie`,
} as const;

// Shipping Configuration - DRY: GRATIS VERZENDING ALTIJD
export const SHIPPING_CONFIG = {
  FREE_SHIPPING_THRESHOLD: 0,  // GRATIS vanaf €0 = altijd gratis
  DEFAULT_COST: 0,              // Altijd €0 verzendkosten
  TAX_RATE: 0.21,               // 21% BTW
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
    // ✅ SECURITY: Generic error - geen gevoelige data
    let errorMessage = 'Er is een fout opgetreden';
    let statusCode = response.status;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // If JSON parse fails, use generic message based on status
      if (statusCode === 500) {
        errorMessage = 'Interne serverfout. Probeer het later opnieuw.';
      } else if (statusCode === 502 || statusCode === 503 || statusCode === 504) {
        errorMessage = 'Server tijdelijk niet beschikbaar. Probeer het later opnieuw.';
      } else if (statusCode === 404) {
        errorMessage = 'Niet gevonden.';
      } else if (statusCode === 401) {
        errorMessage = 'Niet geautoriseerd.';
      } else if (statusCode === 403) {
        errorMessage = 'Toegang geweigerd.';
      }
    }
    
    // ✅ ERROR OBJECT: Include status code for retry logic
    const error = new Error(errorMessage) as any;
    error.status = statusCode;
    error.isGatewayError = statusCode === 502 || statusCode === 503 || statusCode === 504;
    error.isNetworkError = statusCode === 0 || !response;
    throw error;
  }

  return response.json();
};

export type ApiConfig = typeof API_CONFIG;
export type SiteConfig = typeof SITE_CONFIG;

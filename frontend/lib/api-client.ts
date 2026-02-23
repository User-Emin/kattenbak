import axios, { AxiosInstance, AxiosError } from "axios";

/**
 * API Client - Enterprise axios configuration
 * Singleton pattern met error handling
 */
class ApiClient {
  private static instance: AxiosInstance;

  private constructor() {}

  public static getInstance(): AxiosInstance {
    if (!ApiClient.instance) {
      // ✅ DYNAMIC: Use runtime API URL detection (same as config.ts)
      const getRuntimeApiUrl = (): string => {
        if (typeof window === 'undefined') {
          const envUrl = process.env.NEXT_PUBLIC_API_URL;
          if (process.env.NODE_ENV === 'production') {
            if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1'))
              return envUrl.endsWith('/api/v1') ? envUrl : `${envUrl}/api/v1`;
            return 'https://catsupply.nl/api/v1';
          }
          if (envUrl) return envUrl.endsWith('/api/v1') ? envUrl : `${envUrl}/api/v1`;
          return 'http://localhost:3101/api/v1';
        }
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          const envUrl = process.env.NEXT_PUBLIC_API_URL;
          if (envUrl) return envUrl.endsWith('/api/v1') ? envUrl : `${envUrl}/api/v1`;
          return 'http://localhost:3101/api/v1';
        }
        return `${window.location.protocol}//${hostname}/api/v1`;
      };

      ApiClient.instance = axios.create({
        baseURL: getRuntimeApiUrl(),
        timeout: 30000,
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Request interceptor
      ApiClient.instance.interceptors.request.use(
        (config) => {
          // Add auth token if exists
          const token = typeof window !== "undefined" 
            ? localStorage.getItem("auth_token")
            : null;
          
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }

          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );

      // Response interceptor - ✅ 502 ERROR HANDLING
      ApiClient.instance.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
          if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            
            // ✅ 502 PREVENTION: Verberg 502/503/504 errors, toon vriendelijke message
            if (status === 502 || status === 503 || status === 504) {
              // ✅ SECURITY: Generic error message (geen stack trace)
              const friendlyError = new Error('Service tijdelijk niet beschikbaar. Probeer het over een moment opnieuw.');
              (friendlyError as any).status = status;
              (friendlyError as any).isGatewayError = true;
              return Promise.reject(friendlyError);
            }
            
            if (status === 401) {
              // Unauthorized - clear token
              if (typeof window !== "undefined") {
                localStorage.removeItem("auth_token");
                window.location.href = "/admin/login";
              }
            }
          } else if (error.request) {
            // ✅ 502 PREVENTION: Network error (backend down)
            const networkError = new Error('Kan geen verbinding maken met de server. Controleer je internetverbinding.');
            (networkError as any).isNetworkError = true;
            return Promise.reject(networkError);
          }

          return Promise.reject(error);
        }
      );
    }

    return ApiClient.instance;
  }
}

export const api = ApiClient.getInstance();

/**
 * API Response types
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
 * API Error handler - ✅ 502 PREVENTION: Vriendelijke error messages
 */
export function handleApiError(error: any): string {
  // ✅ 502 PREVENTION: Gateway errors krijgen vriendelijke message
  if (error?.isGatewayError || error?.isNetworkError) {
    return error.message || 'Service tijdelijk niet beschikbaar. Probeer het over een moment opnieuw.';
  }
  
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    
    // ✅ 502 PREVENTION: Gateway errors
    if (status === 502 || status === 503 || status === 504) {
      return 'Service tijdelijk niet beschikbaar. Probeer het over een moment opnieuw.';
    }
    
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
  }
  
  // ✅ SECURITY: Generic error (geen stack trace)
  return "Er is een fout opgetreden. Probeer het later opnieuw.";
}



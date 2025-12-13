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
      ApiClient.instance = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
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

      // Response interceptor
      ApiClient.instance.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
          if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            
            if (status === 401) {
              // Unauthorized - clear token
              if (typeof window !== "undefined") {
                localStorage.removeItem("auth_token");
                window.location.href = "/admin/login";
              }
            }
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
 * API Error handler
 */
export function handleApiError(error: any): string {
  if (axios.isAxiosError(error)) {
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
  
  return "Er is een fout opgetreden. Probeer het later opnieuw.";
}



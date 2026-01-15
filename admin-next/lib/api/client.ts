/**
 * API CLIENT - DRY & Type-Safe
 * Centralized axios instance met auth, error handling, interceptors
 */

import axios, { AxiosError, AxiosResponse } from 'axios';

// ✅ DYNAMIC: Runtime API URL detection (same as frontend)
const getRuntimeApiUrl = (): string => {
  // Server-side: use env var
  if (typeof window === 'undefined') {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl) {
      return envUrl.endsWith('/api/v1') ? envUrl : `${envUrl}/api/v1`;
    }
    return 'https://catsupply.nl/api/v1'; // ✅ PRODUCTION: Default to production API
  }
  
  // Client-side: dynamic based on hostname
  const hostname = window.location.hostname;
  
  // Development: use local backend
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl) {
      return envUrl.endsWith('/api/v1') ? envUrl : `${envUrl}/api/v1`;
    }
    return 'http://localhost:3101/api/v1'; // ✅ DEVELOPMENT: Local backend
  }
  
  // Production: use same domain via NGINX reverse proxy
  return `${window.location.protocol}//${hostname}/api/v1`; // ✅ PRODUCTION: HTTPS via same domain
};

const API_URL = getRuntimeApiUrl();

// DRY: Standard API Response Type
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  };
  error?: string;
}

// DRY: Create axios instance
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // ✅ UPLOAD: 60 seconden timeout voor file uploads (was 10 seconden)
});

// DRY: Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Only add token for browser requests (not SSR)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // ✅ FIX: Don't override Content-Type for FormData (file uploads)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      // Let browser set multipart/form-data with boundary
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// DRY: Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Success response - no logging in production
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    // DRY: Comprehensive error logging & handling
    const errorDetails = {
      message: error.message || 'Unknown error',
      code: error.code || 'NO_CODE',
      status: error.response?.status || 0,
      statusText: error.response?.statusText || 'No status',
      url: error.config?.url || 'No URL',
      method: error.config?.method?.toUpperCase() || 'NO_METHOD',
      data: error.response?.data || null,
      // Additional context for file uploads
      contentType: error.config?.headers?.['Content-Type'] || 'unknown',
      dataSize: error.config?.data ? 
        (typeof error.config.data === 'string' ? error.config.data.length : 
         error.config.data instanceof FormData ? 'FormData' : 'Object') : 'none',
    };
    
    // Log with JSON.stringify to avoid {} issue
    console.error('API Error interceptor:', JSON.stringify(errorDetails, null, 2));
    
    // DRY: Centralized error handling
    if (error.response) {
      const { status, data } = error.response;

      // 401: Unauthorized - Clear token and redirect to login (with basePath)
      if (status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        document.cookie = 'token=; path=/; max-age=0';
        window.location.href = '/admin/login';
      }

      // Return structured error with all details
      return Promise.reject({
        status,
        message: data?.error || data?.message || `HTTP ${status} Error`,
        details: data,
        url: error.config?.url,
      });
    }

    // Network error (no response from server)
    if (error.request) {
      return Promise.reject({
        status: 0,
        message: 'Netwerkfout: Kan geen verbinding maken met de server',
        details: { originalError: error.message },
        url: error.config?.url,
      });
    }

    // Other errors (request setup, etc.)
    return Promise.reject({
      status: -1,
      message: error.message || 'Er is een onbekende fout opgetreden',
      details: { code: error.code },
      url: error.config?.url,
    });
  }
);

// DRY: Helper function for GET requests
export const get = <T = any>(url: string, params?: any) => 
  apiClient.get<ApiResponse<T>>(url, { params }).then(res => res.data);

// DRY: Helper function for POST requests
export const post = <T = any>(url: string, data?: any) => 
  apiClient.post<ApiResponse<T>>(url, data).then(res => res.data);

// DRY: Helper function for PUT requests
export const put = <T = any>(url: string, data?: any) => 
  apiClient.put<ApiResponse<T>>(url, data).then(res => res.data);

// DRY: Helper function for DELETE requests
export const del = <T = any>(url: string) => 
  apiClient.delete<ApiResponse<T>>(url).then(res => res.data);


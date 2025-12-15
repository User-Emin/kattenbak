/**
 * API CLIENT - DRY & Type-Safe
 * Centralized axios instance met auth, error handling, interceptors
 */

import axios, { AxiosError, AxiosResponse } from 'axios';

// DRY: API Configuration - ROBUST & CORRECT
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

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
  timeout: 10000,
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
    };
    
    console.error('API Error interceptor:', errorDetails);
    
    // DRY: Centralized error handling
    if (error.response) {
      const { status, data } = error.response;

      // 401: Unauthorized - Clear token and redirect to login
      if (status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/login';
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


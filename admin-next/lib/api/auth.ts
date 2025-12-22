/**
 * AUTH API - DRY Authentication Logic
 */

import { post } from './client';
import { LoginCredentials, LoginResponse, AuthUser } from '@/types/auth';

// DRY: Login API call with comprehensive error handling
export const loginApi = async (credentials: LoginCredentials) => {
  try {
    const response = await post<LoginResponse>('/admin/auth/login', credentials);
    
    if (!response || !response.data) {
      throw new Error('Invalid response: No data received from server');
    }
    
    if (!response.data.token || !response.data.user) {
      throw new Error('Invalid response: Missing token or user data');
    }
    
    return response.data;
  } catch (error: any) {
    // DRY: Comprehensive error logging
    const errorDetails = {
      message: error.message || 'Unknown error',
      status: error.status || 0,
      details: error.details || error.data || null,
      url: error.url || '/admin/auth/login',
    };
    
    console.error('loginApi error:', errorDetails);
    
    // Re-throw with enhanced error message
    throw {
      message: errorDetails.message,
      status: errorDetails.status,
      details: errorDetails.details,
    };
  }
};

// DRY: Store auth data in localStorage + Cookie (for middleware)
export const storeAuth = (token: string, user: AuthUser) => {
  if (typeof window !== 'undefined') {
    console.log('storeAuth: Storing token...', { tokenLength: token.length, userId: user.id }); // Debug
    
    // Store in localStorage (for API calls)
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(user));
    
    // CRITICAL: Store in cookie (for middleware)
    document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;
    
    console.log('storeAuth: Cookie set:', document.cookie.includes('token=')); // Debug
  }
};

// DRY: Get stored auth token
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_token');
  }
  return null;
};

// DRY: Get stored user
export const getUser = (): AuthUser | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('admin_user');
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
};

// DRY: Check if authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// DRY: Logout - clear auth data
export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    // Clear cookie
    document.cookie = 'token=; path=/; max-age=0';
    window.location.href = '/admin/login';
  }
};


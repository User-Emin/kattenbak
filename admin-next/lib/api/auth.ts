import { api } from './client';
import type { AuthUser } from '@/types/auth';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    user: AuthUser;
    token: string;
  };
  error?: string;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/admin/auth/login', credentials);
    return response.data;
  },

  me: async (): Promise<{ success: boolean; data?: AuthUser; error?: string }> => {
    const response = await api.get('/admin/auth/me');
    return response.data;
  },

  logout: async () => {
    localStorage.removeItem('auth_token');
  },
};

// Helper functions for auth-context
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

export const getUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('auth_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const logout = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
};


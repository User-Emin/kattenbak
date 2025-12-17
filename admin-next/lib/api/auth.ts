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


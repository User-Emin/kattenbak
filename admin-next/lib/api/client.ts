import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://catsupply.nl/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// DRY Helper functions
export const get = <T = any>(url: string, params?: any) => 
  api.get<T>(url, { params }).then(res => res.data);

export const post = <T = any>(url: string, data?: any) => 
  api.post<T>(url, data).then(res => res.data);

export const put = <T = any>(url: string, data?: any) => 
  api.put<T>(url, data).then(res => res.data);

export const del = <T = any>(url: string) => 
  api.delete<T>(url).then(res => res.data);


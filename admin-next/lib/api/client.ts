import axios from 'axios';

// FUNDAMENTELE ISOLATIE: Admin app werkt onafhankelijk
// Backend API calls gaan naar BACKEND server (NOT admin basePath)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://catsupply.nl/api/v1';

console.log('[Admin API Client] Using API base:', API_BASE);

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
    console.log('[Admin API] Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('[Admin API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('[Admin API] Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('[Admin API] Response error:', error.response?.status, error.config?.url);
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      window.location.href = '/admin/login'; // Admin basePath routing
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


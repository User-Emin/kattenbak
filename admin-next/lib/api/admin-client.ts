/**
 * ADMIN API CLIENT
 * DRY: Unified fetch wrapper for Next.js API routes in admin panel
 * Security: Auto-adds auth token from localStorage
 * IMPORTANT: Uses /admin base path for API routes
 */

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/admin/login';
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const adminApi = {
  async get<T = any>(path: string): Promise<T> {
    const response = await fetch(`/admin/api${path}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<T>(response);
  },

  async post<T = any>(path: string, data?: any): Promise<T> {
    const response = await fetch(`/admin/api${path}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  },

  async put<T = any>(path: string, data?: any): Promise<T> {
    const response = await fetch(`/admin/api${path}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  },

  async delete<T = any>(path: string): Promise<T> {
    const response = await fetch(`/admin/api${path}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<T>(response);
  },
};

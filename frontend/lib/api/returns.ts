/**
 * RETURN API CLIENT - DRY & Type-Safe
 * Centralized API calls voor return functies
 */

import type {
  ApiResponse,
  CreateReturnRequest,
  CreateReturnResponse,
  Return,
  ReturnEligibility,
} from '@/types/return';

// ✅ DYNAMIC: Use runtime API URL detection (same as config.ts)
const getRuntimeApiUrl = (): string => {
  // Server-side: use env var
  if (typeof window === 'undefined') {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl) {
      return envUrl.endsWith('/api/v1') ? envUrl : `${envUrl}/api/v1`;
    }
    return 'https://catsupply.nl/api/v1';
  }
  
  // Client-side: dynamic based on hostname
  const hostname = window.location.hostname;
  
  // Development: use local backend
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl) {
      return envUrl.endsWith('/api/v1') ? envUrl : `${envUrl}/api/v1`;
    }
    return 'http://localhost:3101/api/v1';
  }
  
  // Production: use same domain via NGINX reverse proxy
  return `${window.location.protocol}//${hostname}/api/v1`;
};

const API_BASE = getRuntimeApiUrl();

/**
 * DRY: Generic API fetch helper
 */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Er ging iets mis',
        errors: data.errors,
      };
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Netwerkfout',
    };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RETURN API FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Check if order is eligible for return
 */
export async function checkReturnEligibility(
  orderId: string
): Promise<ApiResponse<ReturnEligibility>> {
  return apiFetch<ReturnEligibility>(
    `/returns/validate/${orderId}`,
    { method: 'POST' }
  );
}

/**
 * Create return request (customer)
 */
export async function createReturnRequest(
  request: CreateReturnRequest
): Promise<ApiResponse<CreateReturnResponse>> {
  return apiFetch<CreateReturnResponse>('/returns', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Get return by ID
 */
export async function getReturn(
  returnId: string
): Promise<ApiResponse<Return>> {
  return apiFetch<Return>(`/returns/${returnId}`);
}

/**
 * Get returns for order
 */
export async function getOrderReturns(
  orderId: string
): Promise<ApiResponse<Return[]>> {
  return apiFetch<Return[]>(`/returns?orderId=${orderId}`);
}

/**
 * Download return label PDF
 */
export function downloadReturnLabel(labelUrl: string): void {
  window.open(labelUrl, '_blank');
}

/**
 * Download return instructions PDF
 */
export function downloadReturnInstructions(returnId: string): void {
  window.open(
    `${API_BASE}/returns/${returnId}/instructions.pdf`,
    '_blank'
  );
}




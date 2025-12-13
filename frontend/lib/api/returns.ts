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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3101';

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
    `/api/v1/returns/validate/${orderId}`,
    { method: 'POST' }
  );
}

/**
 * Create return request (customer)
 */
export async function createReturnRequest(
  request: CreateReturnRequest
): Promise<ApiResponse<CreateReturnResponse>> {
  return apiFetch<CreateReturnResponse>('/api/v1/returns', {
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
  return apiFetch<Return>(`/api/v1/returns/${returnId}`);
}

/**
 * Get returns for order
 */
export async function getOrderReturns(
  orderId: string
): Promise<ApiResponse<Return[]>> {
  return apiFetch<Return[]>(`/api/v1/returns?orderId=${orderId}`);
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
    `${API_BASE}/api/v1/returns/${returnId}/instructions.pdf`,
    '_blank'
  );
}


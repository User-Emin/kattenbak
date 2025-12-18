import { Response } from 'express';
import { ApiResponse } from '@/types';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * RESPONSE UTILITIES - DRY & Type-Safe
 * Two patterns supported:
 * 1. Direct: successResponse(res, data) - returns Response
 * 2. Object: successResponse(data) - returns JSON object
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

/**
 * Success response - OVERLOADED for flexibility
 */
export function successResponse<T>(data: T, message?: string): ApiResponse<T>;
export function successResponse<T>(res: Response, data: T, message?: string, statusCode?: number): Response;
export function successResponse<T>(
  resOrData: Response | T,
  dataOrMessage?: T | string,
  messageOrUndefined?: string,
  statusCode: number = 200
): Response | ApiResponse<T> {
  // Pattern 1: Direct response (res, data, message?, statusCode?)
  if (resOrData && typeof (resOrData as any).status === 'function') {
    const res = resOrData as Response;
    const data = dataOrMessage as T;
    const message = messageOrUndefined;
    
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
    };
    
    return res.status(statusCode).json(response);
  }
  
  // Pattern 2: Object only (data, message?)
  const data = resOrData as T;
  const message = dataOrMessage as string | undefined;
  
  return {
    success: true,
    data,
    message,
  };
}

/**
 * Error response - OVERLOADED for flexibility
 */
export function errorResponse(message: string, statusCode?: number): ApiResponse;
export function errorResponse(res: Response, message: string, statusCode?: number): Response;
export function errorResponse(
  resOrMessage: Response | string,
  messageOrStatusCode?: string | number,
  statusCodeOrUndefined?: number
): Response | ApiResponse {
  // Pattern 1: Direct response (res, message, statusCode?)
  if (resOrMessage && typeof (resOrMessage as any).status === 'function') {
    const res = resOrMessage as Response;
    const message = messageOrStatusCode as string;
    const statusCode = statusCodeOrUndefined || 500;
    
    const response: ApiResponse = {
      success: false,
      error: message,
    };
    
    return res.status(statusCode).json(response);
  }
  
  // Pattern 2: Object only (message, statusCode?)
  const message = resOrMessage as string;
  
  return {
    success: false,
    error: message,
  };
}

/**
 * Success response with pagination
 */
export const paginatedResponse = <T>(
  res: Response,
  data: T[],
  page: number,
  pageSize: number,
  total: number,
  message?: string
): Response => {
  const totalPages = Math.ceil(total / pageSize);

  const response: ApiResponse<T[]> = {
    success: true,
    data,
    message,
    meta: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };

  return res.status(200).json(response);
};

/**
 * Created response (201)
 */
export const createdResponse = <T>(
  res: Response,
  data: T,
  message?: string
): Response => {
  return successResponse(res, data, message, 201);
};

/**
 * No content response (204)
 */
export const noContentResponse = (res: Response): Response => {
  return res.status(204).send();
};

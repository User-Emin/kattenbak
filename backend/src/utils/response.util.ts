import { Response } from 'express';
import { ApiResponse } from '@/types';

/**
 * Standard success response helper
 */
export const successResponse = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };

  return res.status(statusCode).json(response);
};

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
 * Standard error response helper
 */
export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = 500,
  error?: any
): Response => {
  const response: ApiResponse = {
    success: false,
    error: message,
  };

  return res.status(statusCode).json(response);
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



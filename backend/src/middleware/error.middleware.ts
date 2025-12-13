import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/errors.util';
import { logger } from '@/config/logger.config';
import { env } from '@/config/env.config';
import { errorResponse } from '@/utils/response.util';

/**
 * Global error handler middleware
 * Catches all errors and sends appropriate response
 */
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default error
  let statusCode = 500;
  let message = 'Internal server error';
  let isOperational = false;

  // If it's our custom AppError
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    isOperational = error.isOperational;
  }

  // Log error
  if (!isOperational || statusCode >= 500) {
    logger.error('Error:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      statusCode,
    });
  } else {
    logger.warn('Operational error:', {
      message: error.message,
      url: req.url,
      method: req.method,
      statusCode,
    });
  }

  // Send error response
  errorResponse(
    res,
    message,
    statusCode,
    env.IS_DEVELOPMENT ? { stack: error.stack } : undefined
  );
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  errorResponse(res, `Route ${req.method} ${req.url} not found`, 404);
};



import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.util';
import { logger } from '../config/logger.config';
import { env } from '../config/env.config';
import { errorResponse } from '../utils/response.util';
import multer from 'multer';

// ✅ FIX: Export AppError for use in other modules
export { AppError } from '../utils/errors.util';

/**
 * Global error handler middleware
 * Catches all errors and sends appropriate response
 * ✅ SECURITY: Handles Multer errors (413, file size limits)
 */
export const errorHandler = (
  error: Error | AppError | multer.MulterError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default error
  let statusCode = 500;
  let message = 'Internal server error';
  let isOperational = false;

  // ✅ SECURITY: Handle Multer errors (file upload limits)
  if (error && 'code' in error && error.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    // ✅ DYNAMIC: Get max size from env or default (20MB)
    const maxSizeMB = process.env.UPLOAD_MAX_FILE_SIZE 
      ? Math.round(parseInt(process.env.UPLOAD_MAX_FILE_SIZE, 10) / (1024 * 1024))
      : 20;
    message = `Bestand te groot. Maximum ${maxSizeMB}MB per afbeelding.`;
    isOperational = true;
  } else if (error && 'code' in error && error.code === 'LIMIT_FILE_COUNT') {
    statusCode = 400;
    message = 'Te veel bestanden. Maximum 10 afbeeldingen per upload.';
    isOperational = true;
  } else if (error && 'code' in error && error.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Onverwacht bestand. Controleer de upload configuratie.';
    isOperational = true;
  }
  // If it's our custom AppError
  else if (error instanceof AppError) {
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

  // ✅ SECURITY: Send error response (JSON format for API consistency)
  if (req.path?.startsWith('/api/')) {
    // API routes: return JSON
    return res.status(statusCode).json({
      success: false,
      error: message,
      ...(env.IS_DEVELOPMENT && { stack: error.stack })
    });
  }
  
  // Non-API routes: use errorResponse utility
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



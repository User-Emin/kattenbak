import { Request, Response, NextFunction } from 'express';
import { logger } from '@/config/logger.config';
import { env } from '@/config/env.config';

/**
 * Request logging middleware
 * Logs all incoming requests
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };

    if (res.statusCode >= 500) {
      logger.error('Request failed', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Request error', logData);
    } else if (env.IS_DEVELOPMENT) {
      logger.info('Request', logData);
    }
  });

  next();
};



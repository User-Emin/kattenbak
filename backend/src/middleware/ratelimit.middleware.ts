import rateLimit from 'express-rate-limit';
import { env } from '@/config/env.config';
import { RedisClient } from '@/config/redis.config';
import { logger } from '@/config/logger.config';

/**
 * Rate limiter configuration
 */
const createRateLimiter = (
  windowMs: number,
  max: number,
  message: string = 'Too many requests, please try again later'
) => {
  return rateLimit({
    windowMs,
    max,
    message: { success: false, error: message },
    standardHeaders: true,
    legacyHeaders: false,
    // Use Redis if available, otherwise use memory
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health' || req.path === '/api/v1/health';
    },
    handler: (req, res) => {
      logger.warn('Rate limit exceeded:', {
        ip: req.ip,
        path: req.path,
        method: req.method,
      });
      res.status(429).json({
        success: false,
        error: message,
      });
    },
  });
};

/**
 * General API rate limiter
 */
export const apiRateLimiter = createRateLimiter(
  env.RATE_LIMIT_WINDOW_MS,
  env.RATE_LIMIT_MAX_REQUESTS,
  'Too many requests from this IP, please try again later'
);

/**
 * Strict rate limiter for authentication endpoints
 */
export const authRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many login attempts, please try again after 15 minutes'
);

/**
 * Checkout rate limiter
 */
export const checkoutRateLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  3, // 3 attempts
  'Too many checkout attempts, please wait a minute'
);



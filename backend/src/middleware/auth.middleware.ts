import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.util';

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Geen authenticatie token gevonden'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Ongeldige of verlopen token'
      });
    }

    // Attach user to request
    (req as any).user = decoded;
    
    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authenticatie mislukt'
    });
  }
};

/**
 * Admin Role Middleware
 * Ensures user has ADMIN role
 */
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Geen toegang - Admin rechten vereist'
    });
  }
  
  next();
};

/**
 * Rate Limiting Middleware
 * Prevents brute force attacks
 */
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

export const rateLimitMiddleware = (options: {
  windowMs: number;
  max: number;
  message?: string;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    
    // Clean up expired entries
    if (rateLimitStore[key] && rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
    
    // Initialize or increment
    if (!rateLimitStore[key]) {
      rateLimitStore[key] = {
        count: 1,
        resetTime: now + options.windowMs
      };
    } else {
      rateLimitStore[key].count++;
    }
    
    // Check limit
    if (rateLimitStore[key].count > options.max) {
      return res.status(429).json({
        success: false,
        error: options.message || 'Te veel requests, probeer later opnieuw'
      });
    }
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', options.max.toString());
    res.setHeader('X-RateLimit-Remaining', (options.max - rateLimitStore[key].count).toString());
    res.setHeader('X-RateLimit-Reset', rateLimitStore[key].resetTime.toString());
    
    next();
  };
};

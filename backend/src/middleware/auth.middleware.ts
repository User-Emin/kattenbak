import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '@/types';
import { verifyToken } from '@/utils/auth.util';
import { UnauthorizedError, ForbiddenError } from '@/utils/errors.util';
import { UserRole } from '@prisma/client';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);

    if (!user) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    // Attach user to request
    (req as AuthRequest).user = user;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Authentication failed'));
    }
  }
};

/**
 * Authorization middleware factory
 * Checks if user has required role
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthRequest).user;

    if (!user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!roles.includes(user.role)) {
      return next(
        new ForbiddenError('Insufficient permissions to access this resource')
      );
    }

    next();
  };
};

/**
 * Admin only middleware
 */
export const adminOnly = authorize(UserRole.ADMIN);



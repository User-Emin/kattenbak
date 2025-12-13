import { Request, Response, NextFunction } from 'express';
import { generateToken, hashPassword, comparePasswords } from '@/utils/auth.util';
import { successResponse } from '@/utils/response.util';
import { UnauthorizedError } from '@/utils/errors.util';
import { logger } from '@/config/logger.config';
import { env } from '@/config/env.config';

/**
 * Admin Auth Controller - DRY & Database-free version
 * Works without Prisma/Database for development
 */

// Mock admin user from env
const MOCK_ADMIN = {
  id: 'admin-1',
  email: env.ADMIN_EMAIL,
  password: env.ADMIN_PASSWORD,
  role: 'ADMIN' as const,
  firstName: 'Admin',
  lastName: 'User',
};

export class AdminAuthController {
  /**
   * Admin login - Database-free
   * POST /api/v1/admin/auth/login
   */
  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;

      // Simple comparison for development
      if (email !== MOCK_ADMIN.email || password !== MOCK_ADMIN.password) {
        throw new UnauthorizedError('Invalid credentials');
      }

      // Generate JWT token
      const token = generateToken({
        id: MOCK_ADMIN.id,
        email: MOCK_ADMIN.email,
        role: MOCK_ADMIN.role,
      });

      logger.info(`✅ Admin login successful: ${email}`);

      // DRY: Correct successResponse usage
      successResponse(res, {
        token,
        user: {
          id: MOCK_ADMIN.id,
          email: MOCK_ADMIN.email,
          role: MOCK_ADMIN.role,
          firstName: MOCK_ADMIN.firstName,
          lastName: MOCK_ADMIN.lastName,
        },
      });
    } catch (error) {
      logger.error('â Admin login failed:', error);
      next(error);
    }
  }
}

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateToken, comparePasswords } from '../../utils/auth.util';
import { successResponse } from '../../utils/response.util';
import { UnauthorizedError } from '../../utils/errors.util';
import { logger } from '../../config/logger.config';

/**
 * Admin Auth Controller - DATABASE VERSION
 * DRY: Uses Prisma for secure, production-ready authentication
 * Security: bcrypt password hashing, JWT tokens
 */

const prisma = new PrismaClient();

export class AdminAuthController {
  /**
   * Admin login - DATABASE with bcrypt
   * POST /api/v1/admin/auth/login
   * 
   * Security:
   * - Bcrypt password comparison (timing-attack safe)
   * - JWT token generation with expiry
   * - Role verification (ADMIN only)
   * - Encrypted database storage
   */
  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;

      // DRY: Find user in database by email
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          passwordHash: true,
          role: true,
          firstName: true,
          lastName: true,
        }
      });

      // Security: User not found (same error message as wrong password)
      if (!user) {
        logger.warn(`❌ Login attempt for non-existent user: ${email}`);
        throw new UnauthorizedError('Ongeldige inloggegevens');
      }

      // Security: Verify role is ADMIN
      if (user.role !== 'ADMIN') {
        logger.warn(`❌ Non-admin login attempt: ${email} (role: ${user.role})`);
        throw new UnauthorizedError('Ongeldige inloggegevens');
      }

      // Security: Compare passwords with bcrypt (timing-attack safe)
      const isPasswordValid = await comparePasswords(password, user.passwordHash);
      
      if (!isPasswordValid) {
        logger.warn(`❌ Invalid password for admin: ${email}`);
        throw new UnauthorizedError('Ongeldige inloggegevens');
      }

      // DRY: Update last login timestamp
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      // Security: Generate JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      logger.info(`✅ Admin login successful: ${email} (ID: ${user.id})`);

      // DRY: Return token + user data
      successResponse(res, {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName || 'Admin',
          lastName: user.lastName || 'User',
        },
      });
    } catch (error) {
      logger.error('❌ Admin login failed:', error);
      next(error);
    }
  }
}

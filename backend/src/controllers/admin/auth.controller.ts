import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateToken, comparePasswords, hashPassword } from '../../utils/auth.util';
import { successResponse } from '../../utils/response.util';
import { UnauthorizedError } from '../../utils/errors.util';
import { logger } from '../../config/logger.config';
import { env } from '../../config/env.config';

/**
 * Admin Auth Controller - DATABASE VERSION
 * DRY: Uses Prisma for secure, production-ready authentication
 * Security: bcrypt password hashing, JWT tokens
 * ✅ SECURITY_POLICY: Admin credentials via env only (no hardcoding)
 */

const prisma = new PrismaClient();

// Cache hash of env password for fallback (when DB has no user)
let fallbackPasswordHash: string | null = null;
async function getFallbackHash(): Promise<string> {
  if (!fallbackPasswordHash) {
    fallbackPasswordHash = await hashPassword(env.ADMIN_PASSWORD);
  }
  return fallbackPasswordHash;
}

export class AdminAuthController {
  /**
   * Admin login - DATABASE with bcrypt
   * POST /api/v1/admin/auth/login
   * 
   * Security:
   * - Bcrypt password comparison (timing-attack safe)
   * - JWT token generation with expiry
   * - Role verification (ADMIN only)
   * - Credentials from env (SECURITY_POLICY compliant)
   */
  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;

      // ✅ SECURITY_POLICY: Admin credentials via env (no hardcoding)
      const ADMIN_EMAIL = env.ADMIN_EMAIL;

      let user = null;
      let useDatabase = false;

      // Try database first (if available)
      try {
        user = await prisma.user.findUnique({
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
        useDatabase = true;
      } catch (dbError: any) {
        // Database not available, use fallback
        logger.warn('⚠️ Database not available for login, using fallback credentials');
        useDatabase = false;
      }

      // If no user found in database, check env fallback
      if (!user) {
        const fallbackHash = await getFallbackHash();
        if (email !== ADMIN_EMAIL) {
          // Timing attack prevention: still hash to take same time
          await comparePasswords(password, fallbackHash);
          throw new UnauthorizedError('Ongeldige inloggegevens');
        }

        // Verify password with env-derived hash
        const isPasswordValid = await comparePasswords(password, fallbackHash);

        if (!isPasswordValid) {
          throw new UnauthorizedError('Ongeldige inloggegevens');
        }

        // Use fallback user data
        user = {
          id: '1',
          email: ADMIN_EMAIL,
          passwordHash: fallbackHash,
          role: 'ADMIN',
          firstName: 'Admin',
          lastName: 'User',
        };
      } else {
        // User found in database - verify role and password
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

        // DRY: Update last login timestamp (only if database available)
        if (useDatabase) {
          try {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });
          } catch (updateError) {
            // Ignore update errors (not critical)
            logger.warn('⚠️ Could not update last login timestamp');
          }
        }
      }

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

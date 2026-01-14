import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';

// DRY: Type for JWT payload
export interface JWTPayload {
  id: string;
  email: string;
  role: string; // Changed from UserRole to string for flexibility
}

/**
 * Hash password with bcrypt (12 rounds = secure + fast)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Compare password with hash (timing-attack safe)
 */
export async function comparePasswords(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token with expiry
 * ✅ SECURITY: HS256 algorithm (RFC 7519), algorithm whitelisting
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    algorithm: 'HS256', // ✅ SECURITY: Explicit algorithm whitelisting (RFC 7519)
  } as jwt.SignOptions);
}

/**
 * Verify JWT token (returns null if invalid/expired)
 * ✅ SECURITY: Algorithm whitelisting (prevents algorithm confusion attacks)
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256'], // ✅ SECURITY: Algorithm whitelisting (RFC 7519)
    }) as JWTPayload;
  } catch {
    return null;
  }
}

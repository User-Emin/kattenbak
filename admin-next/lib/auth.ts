/**
 * AUTH UTILITIES - Server-Side Only
 * Security: JWT verification, bcrypt hashing
 * DRY: Shared utilities voor alle API routes
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// SECURITY: Strong JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  exp?: number;
}

/**
 * Hash password with bcrypt (12 rounds)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
export function generateToken(payload: Omit<JWTPayload, 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify JWT token
 * Returns payload if valid, null if invalid/expired
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Get user from request headers
 * Returns user payload if authenticated, null otherwise
 */
export function getUserFromRequest(headers: Headers): JWTPayload | null {
  const authHeader = headers.get('authorization');
  const token = extractToken(authHeader);
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}

/**
 * Check if user is admin
 */
export function isAdmin(user: JWTPayload | null): boolean {
  return user?.role === 'ADMIN';
}





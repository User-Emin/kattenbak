import { Router } from 'express';
import { hashPassword, comparePasswords, generateToken } from '../utils/auth.util';
import { env } from '../config/env.config';

const router = Router();

// Cache hash for env fallback (SECURITY_POLICY: no hardcoded credentials)
let fallbackHash: string | null = null;
async function getFallbackHash(): Promise<string> {
  if (!fallbackHash) fallbackHash = await hashPassword(env.ADMIN_PASSWORD);
  return fallbackHash;
}

/**
 * POST /api/v1/admin/auth/login
 * SECURE: JWT + bcrypt Admin Login Endpoint
 * ✅ SECURITY_POLICY: Credentials via env only
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email en wachtwoord zijn verplicht'
      });
    }

    const ADMIN_EMAIL = env.ADMIN_EMAIL;
    const ADMIN_PASSWORD_HASH = await getFallbackHash();

    // Check email
    if (email !== ADMIN_EMAIL) {
      // Timing attack prevention: still hash to take same time
      await comparePasswords(password, ADMIN_PASSWORD_HASH);
      return res.status(401).json({
        success: false,
        error: 'Ongeldige inloggegevens'
      });
    }

    // Verify password with bcrypt
    const isValid = await comparePasswords(password, ADMIN_PASSWORD_HASH);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Ongeldige inloggegevens'
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: '1',
      email: ADMIN_EMAIL,
      role: 'ADMIN'
    });
    
    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: '1',
          email: ADMIN_EMAIL,
          role: 'ADMIN',
          firstName: 'Admin',
          lastName: 'User'
        }
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Er is een fout opgetreden'
    });
  }
});

export default router;



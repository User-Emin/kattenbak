import { Router } from 'express';
import { hashPassword, comparePasswords, generateToken } from '../utils/auth.util';

const router = Router();

/**
 * POST /api/v1/admin/auth/login
 * SECURE: JWT + bcrypt Admin Login Endpoint
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

    // PRODUCTION: Admin credentials (TODO: move to database)
    const ADMIN_EMAIL = 'admin@catsupply.nl';
    // Bcrypt hash of 'admin123' - VERIFIED WORKING (bcrypt 12 rounds)
    const ADMIN_PASSWORD_HASH = '$2a$12$SQAWDBghvnkgmzfn5PLcfuw.ur63toKdyEfbFQ6i1oUaLo3ShJOcG';

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



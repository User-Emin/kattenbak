import { Router } from 'express';
import bcrypt from 'bcrypt';

const router = Router();

/**
 * POST /api/v1/admin/auth/login
 * DRY & Secure Admin Login Endpoint
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

    // DRY: Simple hardcoded admin for development
    // TODO: Replace with database lookup in production
    const ADMIN_EMAIL = 'admin@localhost';
    const ADMIN_PASSWORD = 'admin123'; // In production: use bcrypt hash

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Generate simple token (in production: use JWT)
      const token = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
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
    }

    // Invalid credentials
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;

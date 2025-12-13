import { Router } from 'express';
import { AdminAuthController } from '@/controllers/admin/auth.controller';
import { validateRequest } from '@/middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

// DRY Login Schema - Accept localhost emails for development
const loginSchema = z.object({
  body: z.object({
    email: z.string().min(3, 'Email required'), // Relaxed validation
    password: z.string().min(1, 'Password is required'),
  }),
});

router.post('/login', validateRequest(loginSchema), AdminAuthController.login);

export default router;

import { Router } from 'express';
import { z } from 'zod';
import axios from 'axios';

const router = Router();

// hCaptcha config - SECURE: Only from environment
const HCAPTCHA_SECRET = process.env.HCAPTCHA_SECRET_KEY || '';
const HCAPTCHA_VERIFY_URL = 'https://hcaptcha.com/siteverify';

// Validation
const contactSchema = z.object({
  email: z.string().email(),
  message: z.string().min(1).max(2000),
  orderNumber: z.string().optional(),
  captchaToken: z.string().min(1),
});

// In-memory storage (simple, geen database)
const messages: any[] = [];

/**
 * POST /api/v1/contact - SIMPEL ZONDER DATABASE
 */
router.post('/', async (req, res) => {
  try {
    const data = contactSchema.parse(req.body);

    // Verify hCaptcha
    const formData = new URLSearchParams();
    formData.append('secret', HCAPTCHA_SECRET);
    formData.append('response', data.captchaToken);

    const captchaResponse = await axios.post(HCAPTCHA_VERIFY_URL, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 5000,
    });

    if (!captchaResponse.data.success) {
      console.warn('hCaptcha failed:', captchaResponse.data['error-codes']);
      return res.status(403).json({
        success: false,
        message: 'Verificatie mislukt',
        error: captchaResponse.data['error-codes'],
      });
    }

    // Store message in memory
    const message = {
      id: Date.now().toString(),
      email: data.email,
      message: data.message,
      orderNumber: data.orderNumber,
      createdAt: new Date().toISOString(),
      ip: req.ip,
      status: 'new',
    };

    messages.push(message);

    console.log('✅ Contact bericht ontvangen:', {
      id: message.id,
      email: message.email,
      preview: message.message.substring(0, 50),
    });

    res.status(201).json({
      success: true,
      message: 'Bericht ontvangen',
      data: { id: message.id },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validatie fout',
        errors: error.errors,
      });
    }

    console.error('Contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server fout',
    });
  }
});

/**
 * GET /api/v1/contact - Haal berichten op (admin)
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: messages.sort((a, b) => b.id.localeCompare(a.id)),
    total: messages.length,
  });
});

export default router;

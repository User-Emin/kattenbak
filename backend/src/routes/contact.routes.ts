import { Router } from 'express';
import { z } from 'zod';
import { verifyCaptcha } from '../middleware/captcha.middleware';

const router = Router();

// DRY: Validation schema met hCaptcha (GDPR-compliant)
const contactMessageSchema = z.object({
  email: z.string().email('Ongeldig email adres'),
  message: z.string().min(1, 'Bericht is verplicht').max(2000, 'Bericht te lang'),
  orderNumber: z.string().optional(),
  captchaToken: z.string().min(1, 'hCaptcha token is verplicht'),
});

// In-memory storage voor demo (in productie: database)
interface ContactMessage {
  id: string;
  email: string;
  message: string;
  orderNumber?: string;
  createdAt: Date;
  status: 'new' | 'read' | 'replied';
}

const messages: ContactMessage[] = [];

/**
 * POST /api/v1/contact
 * Verstuur contact bericht
 */
router.post('/', async (req, res) => {
  try {
    const validatedData = contactMessageSchema.parse(req.body);

    // DRY: Verify hCaptcha token (GDPR-COMPLIANT SPAM PROTECTION)
    const captchaResult = await verifyCaptcha(validatedData.captchaToken);
    
    if (!captchaResult.valid) {
      console.warn('🚫 hCaptcha failed:', {
        ip: req.ip,
        email: validatedData.email,
        score: captchaResult.score,
      });
      
      return res.status(403).json({
        success: false,
        message: 'Verificatie mislukt. Ben je een robot?',
        error: captchaResult.error,
      });
    }

    console.log('✅ hCaptcha passed (GDPR-compliant):', { score: captchaResult.score });

    const newMessage: ContactMessage = {
      id: `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: validatedData.email,
      message: validatedData.message,
      orderNumber: validatedData.orderNumber,
      createdAt: new Date(),
      status: 'new',
    };

    messages.unshift(newMessage);

    console.log('📧 Nieuw contact bericht:', {
      id: newMessage.id,
      email: newMessage.email,
      orderNumber: newMessage.orderNumber,
      preview: newMessage.message.substring(0, 50),
    });

    res.status(201).json({
      success: true,
      message: 'Bericht ontvangen',
      data: {
        id: newMessage.id,
        createdAt: newMessage.createdAt,
      },
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
      message: 'Server fout bij verzenden bericht',
    });
  }
});

/**
 * GET /api/v1/contact
 * Haal alle berichten op (voor admin)
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: messages,
    total: messages.length,
  });
});

/**
 * PATCH /api/v1/contact/:id/status
 * Update status van bericht
 */
router.patch('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const message = messages.find((m) => m.id === id);
  
  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Bericht niet gevonden',
    });
  }

  if (!['new', 'read', 'replied'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Ongeldige status',
    });
  }

  message.status = status;

  res.json({
    success: true,
    message: 'Status bijgewerkt',
    data: message,
  });
});

export default router;


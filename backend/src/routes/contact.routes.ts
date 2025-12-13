import { Router } from 'express';
import { z } from 'zod';
import { verifyCaptcha } from '../middleware/captcha.middleware';
import prisma from '../lib/prisma';

const router = Router();

// DRY: Validation schema met hCaptcha (GDPR-compliant)
const contactMessageSchema = z.object({
  email: z.string().email('Ongeldig email adres'),
  message: z.string().min(1, 'Bericht is verplicht').max(2000, 'Bericht te lang'),
  orderNumber: z.string().optional(),
  captchaToken: z.string().min(1, 'hCaptcha token is verplicht'),
});

/**
 * POST /api/v1/contact
 * Verstuur contact bericht (DRY: Database storage)
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

    // DRY: Save to database
    const newMessage = await prisma.contactMessage.create({
      data: {
        email: validatedData.email,
        message: validatedData.message,
        orderNumber: validatedData.orderNumber,
        captchaToken: validatedData.captchaToken,
        captchaScore: captchaResult.score,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    console.log('📧 Nieuw contact bericht (database):', {
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
 * Haal alle berichten op (voor admin) - DRY: Database
 */
router.get('/', async (req, res) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: messages,
      total: messages.length,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server fout bij ophalen berichten',
    });
  }
});

/**
 * PATCH /api/v1/contact/:id/status
 * Update status van bericht - DRY: Database
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'read', 'replied'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Ongeldige status',
      });
    }

    const updateData: any = { status };
    
    // Track timestamps
    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Bericht niet gevonden',
      });
    }
    
    if (status === 'read' && !existing.readAt) {
      updateData.readAt = new Date();
    }
    
    if (status === 'replied' && !existing.repliedAt) {
      updateData.repliedAt = new Date();
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Status bijgewerkt',
      data: updated,
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server fout bij updaten status',
    });
  }
});

export default router;


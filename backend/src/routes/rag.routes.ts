/**
 * RAG API ROUTES
 * No hCaptcha - security via rate limiting + input validation
 */

import { Router, Request, Response } from 'express';
import { RAGService } from '../services/rag/rag.service';
import { RAGSecurityMiddleware } from '../middleware/rag-security.middleware';

const router = Router();

/**
 * POST /api/v1/rag/chat
 * Ask question using RAG (no hCaptcha required)
 */
router.post('/chat', RAGSecurityMiddleware.checkSecurity, async (req: Request, res: Response) => {
  try {
    const sanitizedQuery = req.body.sanitized_query;
    
    if (!sanitizedQuery || sanitizedQuery.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Vraag is te kort. Stel een volledige vraag.'
      });
    }
    
    // Generate RAG response
    const response = await RAGService.answerQuestion(sanitizedQuery);
    
    // Update log with response
    const latency = response.latency_ms;
    
    res.json({
      success: true,
      data: {
        answer: response.answer,
        latency_ms: latency,
        model: response.model,
        sources_count: response.sources.length
      }
    });
    
  } catch (err: any) {
    console.error('RAG chat error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Er ging iets mis bij het verwerken van je vraag. Probeer het opnieuw.'
    });
  }
});

/**
 * GET /api/v1/rag/health
 * Check RAG system health
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Quick health check
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const docCount = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*)::int as count FROM document_embeddings
    `;
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        documents_loaded: Number(docCount[0].count),
        model: 'llama3.2:3b',
        embeddings_model: 'all-MiniLM-L6-v2'
      }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'RAG system unhealthy',
      details: err.message
    });
  }
});

export default router;

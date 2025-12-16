/**
 * RAG API ROUTES
 * No hCaptcha - security via rate limiting + input validation
 */

import { Router, Request, Response } from 'express';
import { RAGProductionService } from '../services/rag/rag-production.service';
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
    
    // Production RAG with Claude
    const response = await RAGProductionService.answerQuestion(sanitizedQuery);
    
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
    const { VectorStoreService } = require('../services/rag/vector-store.service');
    const health = await RAGProductionService.healthCheck();
    const docCount = VectorStoreService.getCount();
    
    res.json({
      success: true,
      data: {
        status: health.claude && health.vectorStore && health.embeddings ? 'healthy' : 'degraded',
        storage: 'in-memory',
        documents_loaded: docCount,
        model: 'claude-3-5-haiku-20241022',
        embeddings_model: 'intfloat/multilingual-e5-base',
        backends: health
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

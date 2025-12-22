/**
 * RAG API ROUTES
 * SIMPLE KEYWORD RETRIEVAL (no embeddings)
 * Security via rate limiting + input validation
 */

import { Router, Request, Response } from 'express';
import { ClaudeSimpleService } from '../services/rag/claude-simple.service';
import { RAGSecurityMiddleware } from '../middleware/rag-security.middleware';
import { VectorStoreService } from '../services/rag/vector-store.service';

const router = Router();

/**
 * POST /api/v1/rag/chat
 * Ask question using RAG (keyword search + Claude)
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
    
    // Simple keyword retrieval + Claude API
    const response = await ClaudeSimpleService.answerQuestion(sanitizedQuery);
    
    res.json({
      success: true,
      data: {
        answer: response.answer,
        latency_ms: response.latency_ms,
        model: response.model,
        sources_count: response.sources.length,
        backend: response.backend
      }
    });
    
  } catch (error: any) {
    console.error('RAG chat error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Er ging iets mis bij het verwerken van je vraag. Probeer het opnieuw.'
    });
  }
});

/**
 * GET /api/v1/rag/health
 * Health check endpoint
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = await ClaudeSimpleService.healthCheck();
    const docCount = VectorStoreService.getCount();
    
    const allHealthy = health.claude && health.vectorStore && health.retrieval;
    
    res.status(allHealthy ? 200 : 503).json({
      success: allHealthy,
      data: {
        status: allHealthy ? 'healthy' : 'degraded',
        storage: 'in-memory + file',
        documents_loaded: docCount,
        model: 'claude-3-5-haiku-20241022',
        retrieval: 'keyword-based (no embeddings)',
        components: health
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      details: error.message
    });
  }
});

export default router;

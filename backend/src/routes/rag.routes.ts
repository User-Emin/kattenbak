/**
 * 🚀 ENTERPRISE RAG API ROUTES
 * 
 * Features:
 * - 5 RAG Techniques (embeddings, rewriting, filtering, reranking, secure LLM)
 * - 6-Layer Security (input validation, isolation, sandboxing, validation, safeguards, filtering)
 * - Comprehensive metrics (MRR, NDCG, RAGAS, OPI)
 * - Full observability (latency breakdown per technique)
 * 
 * Security: Rate limiting + 6-layer defense
 */

import { Router, Request, Response } from 'express';
import { EnhancedRAGPipelineService } from '../services/rag/enhanced-rag-pipeline.service';
import { RAGSecurityMiddleware } from '../middleware/rag-security.middleware';
import { VectorStoreService } from '../services/rag/vector-store.service';
import { EmbeddingsHuggingFaceService } from '../services/rag/embeddings-huggingface.service';
import { QueryRewritingService } from '../services/rag/query-rewriting.service';
import { SecureLLMService } from '../services/rag/secure-llm.service';

const router = Router();

/**
 * POST /api/v1/rag/chat
 * Ask question using Enhanced RAG Pipeline
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
    
    // Enhanced RAG Pipeline (5 techniques + 6-layer security)
    const response = await EnhancedRAGPipelineService.query({
      query: sanitizedQuery,
      conversation_history: req.body.conversation_history,
      options: {
        // Enable all techniques by default
        enable_query_rewriting: true,
        enable_hierarchical_filter: true,
        enable_embeddings: true,
        enable_reranking: true,
        
        // Allow client to override via query params
        ...(req.query.techniques ? JSON.parse(req.query.techniques as string) : {})
      }
    });
    
    // Return response (already processed through Layer 6)
    res.json(response);
    
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
 * Comprehensive health check
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Check all components
    const pipelineHealth = await EnhancedRAGPipelineService.healthCheck();
    const embeddingsHealth = await EmbeddingsHuggingFaceService.healthCheck();
    const rewritingHealth = await QueryRewritingService.healthCheck();
    const llmHealth = await SecureLLMService.healthCheck();
    
    const docCount = VectorStoreService.getCount();
    const cacheStats = EmbeddingsHuggingFaceService.getCacheStats();
    
    const allHealthy = pipelineHealth.status === 'healthy';
    
    res.status(allHealthy ? 200 : 503).json({
      success: allHealthy,
      data: {
        status: allHealthy ? 'healthy' : 'degraded',
        storage: 'in-memory + file',
        documents_loaded: docCount,
        model: 'claude-3-5-haiku-20241022',
        embeddings: 'multilingual-e5-base (HuggingFace)',
        techniques: ['embeddings', 'query_rewriting', 'hierarchical_filtering', 'reranking', 'secure_llm'],
        security_layers: 6,
        components: {
          pipeline: pipelineHealth.status,
          embeddings: embeddingsHealth.status,
          rewriting: rewritingHealth.status,
          llm: llmHealth.status,
          vector_store: docCount > 0 ? 'healthy' : 'empty'
        },
        cache: {
          embeddings_cached: cacheStats.size,
          cache_max: cacheStats.maxSize
        }
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

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
import { redisGet, redisSet } from '../utils/redis.util';
import crypto from 'crypto';

const router = Router();

// ✅ RAG QUERY CACHING: Prevent overloading with Redis (query + product_context)
const hashQuery = (query: string, productSlug?: string): string => {
  const payload = query.toLowerCase().trim() + (productSlug ? `:${productSlug}` : '');
  return crypto.createHash('sha256').update(payload).digest('hex');
};

const normalizeConversationHistory = (
  history: Array<{ role?: string; content?: string; question?: string; answer?: string }> | undefined
): Array<{ question: string; answer: string }> | undefined => {
  if (!Array.isArray(history) || history.length === 0) return undefined;

  // If already in Q/A shape, keep it
  if (history.every(item => typeof item.question === 'string' || typeof item.answer === 'string')) {
    return history
      .filter(item => item.question && item.answer)
      .map(item => ({ question: String(item.question), answer: String(item.answer) }));
  }

  // Convert role/content pairs into Q/A
  const pairs: Array<{ question: string; answer: string }> = [];
  let pendingQuestion: string | null = null;
  history.forEach(item => {
    if (item.role === 'user' && item.content) {
      pendingQuestion = item.content;
      return;
    }
    if (item.role === 'assistant' && item.content && pendingQuestion) {
      pairs.push({ question: pendingQuestion, answer: item.content });
      pendingQuestion = null;
    }
  });

  return pairs.length > 0 ? pairs : undefined;
};

/**
 * POST /api/v1/rag/chat
 * Ask question using Enhanced RAG Pipeline
 */
router.post('/chat', RAGSecurityMiddleware.checkSecurity, async (req: Request, res: Response) => {
  try {
    // ✅ LAZY LOADING: Initialize vector store only when RAG is used
    await VectorStoreService.ensureInitialized();
    
    // ✅ FIX: Accept both 'query' (from frontend) and 'sanitized_query' (from middleware)
    const sanitizedQuery = req.body.sanitized_query || req.body.query;
    
    if (!sanitizedQuery || sanitizedQuery.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Vraag is te kort. Stel een volledige vraag.'
      });
    }
    
    // ✅ RAG CACHING: Check Redis cache first (query + product slug voor product-specifieke antwoorden)
    const productSlug = req.body.product_context?.slug;
    const cacheKey = `rag:query:${hashQuery(sanitizedQuery, productSlug)}`;
    const cachedResponse = await redisGet(cacheKey);
    
    if (cachedResponse) {
      console.log('✅ RAG Response from cache (CPU saved)');
      return res.json(JSON.parse(cachedResponse));
    }
    
    // Enhanced RAG Pipeline (5 techniques + 6-layer security + product context + warnings)
    const response = await EnhancedRAGPipelineService.query({
      query: sanitizedQuery,
      conversation_history: normalizeConversationHistory(req.body.conversation_history),
      product_context: req.body.product_context ?? undefined,
      options: {
        // Enable all techniques by default
        enable_query_rewriting: true,
        enable_hierarchical_filter: true,
        enable_embeddings: true,
        enable_reranking: true,
        
        // Allow client to override via query params
        ...(req.query.techniques ? JSON.parse(req.query.techniques as string) : {})
      }
    } as any);
    
    // ✅ CACHE RESPONSE: Store in Redis for 1 hour (3600 seconds)
    await redisSet(cacheKey, JSON.stringify(response), 3600);
    
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
    // ✅ LAZY LOADING: Initialize vector store for health check
    await VectorStoreService.ensureInitialized();
    
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
        model: process.env.CLAUDE_MODEL || 'claude-haiku-4-5',
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

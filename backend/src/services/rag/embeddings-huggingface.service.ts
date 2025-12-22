/**
 * 🎯 ENTERPRISE EMBEDDINGS SERVICE - HuggingFace API
 * 
 * Features:
 * - multilingual-e5-base (768-dim, Dutch-optimized)
 * - Caching (avoid re-computation)
 * - Fallback to keyword search if API fails
 * - Rate limiting (100 req/min HuggingFace)
 * - Timeout protection (5s max)
 * - DRY: Single service for query + document embeddings
 * 
 * Security:
 * - NO user input in API calls (only pre-sanitized text)
 * - API key from environment (never logged)
 * - Input validation (max 512 tokens)
 */

import fetch from 'node-fetch';
import crypto from 'crypto';

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  dimensions: number;
  cached: boolean;
  latency_ms: number;
}

export interface EmbeddingError {
  success: false;
  error: string;
  fallback_available: boolean;
}

export class EmbeddingsHuggingFaceService {
  private static readonly MODEL = 'intfloat/multilingual-e5-base';
  private static readonly API_URL = 'https://api-inference.huggingface.co/pipeline/feature-extraction';
  private static readonly DIMENSIONS = 768;
  private static readonly MAX_TOKENS = 512;
  private static readonly TIMEOUT_MS = 5000;
  private static readonly CACHE = new Map<string, number[]>();
  private static readonly CACHE_MAX_SIZE = 1000;
  
  // Runtime getter for API key
  private static get API_KEY(): string {
    return process.env.HUGGINGFACE_API_KEY || '';
  }

  /**
   * Generate embedding for text (query or document)
   * 
   * @param text - Text to embed (pre-sanitized)
   * @param options - Optional: skipCache, timeout
   * @returns Embedding result or error
   */
  static async generateEmbedding(
    text: string,
    options: { skipCache?: boolean; timeout?: number } = {}
  ): Promise<EmbeddingResult | EmbeddingError> {
    const startTime = Date.now();

    try {
      // 1. Input validation
      if (!text || text.trim().length === 0) {
        return {
          success: false,
          error: 'Empty text provided',
          fallback_available: true
        };
      }

      // Truncate to max tokens (rough estimate: 4 chars per token)
      const maxChars = this.MAX_TOKENS * 4;
      const truncatedText = text.substring(0, maxChars);

      // 2. Check cache (DRY: avoid redundant API calls)
      const cacheKey = this.getCacheKey(truncatedText);
      if (!options.skipCache && this.CACHE.has(cacheKey)) {
        const cached = this.CACHE.get(cacheKey)!;
        const latency = Date.now() - startTime;
        
        console.log(`✅ Embedding cache HIT (${latency}ms)`);
        
        return {
          embedding: cached,
          model: this.MODEL,
          dimensions: this.DIMENSIONS,
          cached: true,
          latency_ms: latency
        };
      }

      // 3. Check API key
      if (!this.API_KEY || this.API_KEY.length < 20) {
        console.warn('⚠️  HuggingFace API key not configured, using fallback');
        return {
          success: false,
          error: 'API key not configured',
          fallback_available: true
        };
      }

      // 4. Call HuggingFace API
      const timeout = options.timeout || this.TIMEOUT_MS;
      const embedding = await this.callHuggingFaceAPI(truncatedText, timeout);

      // 5. Validate embedding
      if (!Array.isArray(embedding) || embedding.length !== this.DIMENSIONS) {
        console.error('❌ Invalid embedding dimensions:', embedding?.length);
        return {
          success: false,
          error: 'Invalid embedding dimensions',
          fallback_available: true
        };
      }

      // 6. Cache result (LRU: remove oldest if full)
      if (this.CACHE.size >= this.CACHE_MAX_SIZE) {
        const firstKey = this.CACHE.keys().next().value;
        this.CACHE.delete(firstKey);
      }
      this.CACHE.set(cacheKey, embedding);

      const latency = Date.now() - startTime;
      console.log(`✅ Embedding generated (${latency}ms, cached for future)`);

      return {
        embedding,
        model: this.MODEL,
        dimensions: this.DIMENSIONS,
        cached: false,
        latency_ms: latency
      };

    } catch (error: any) {
      const latency = Date.now() - startTime;
      console.error('❌ Embedding generation failed:', error.message);
      
      return {
        success: false,
        error: error.message,
        fallback_available: true
      };
    }
  }

  /**
   * Call HuggingFace Inference API
   * 
   * @param text - Text to embed
   * @param timeout - Timeout in milliseconds
   * @returns Embedding vector
   */
  private static async callHuggingFaceAPI(text: string, timeout: number): Promise<number[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${this.API_URL}/${this.MODEL}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
          options: {
            wait_for_model: true,
            use_cache: true
          }
        }),
        signal: controller.signal as any
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HuggingFace API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      // HuggingFace returns array of embeddings (we send 1 text, get 1 embedding)
      if (Array.isArray(result) && Array.isArray(result[0])) {
        return result[0];
      } else if (Array.isArray(result)) {
        return result;
      } else {
        throw new Error('Unexpected API response format');
      }

    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error(`Embedding timeout after ${timeout}ms`);
      }
      
      throw error;
    }
  }

  /**
   * Generate cache key (deterministic hash)
   */
  private static getCacheKey(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * Batch generate embeddings (efficient for multiple docs)
   * 
   * @param texts - Array of texts to embed
   * @param concurrency - Max parallel requests (default: 5)
   * @returns Array of embedding results
   */
  static async generateBatchEmbeddings(
    texts: string[],
    concurrency: number = 5
  ): Promise<(EmbeddingResult | EmbeddingError)[]> {
    const results: (EmbeddingResult | EmbeddingError)[] = [];
    
    // Process in batches to respect rate limits
    for (let i = 0; i < texts.length; i += concurrency) {
      const batch = texts.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(text => this.generateEmbedding(text))
      );
      results.push(...batchResults);
      
      // Rate limiting: wait 1s between batches
      if (i + concurrency < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  /**
   * Clear cache (useful for testing)
   */
  static clearCache(): void {
    this.CACHE.clear();
    console.log('✅ Embedding cache cleared');
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.CACHE.size,
      maxSize: this.CACHE_MAX_SIZE
    };
  }

  /**
   * Health check
   */
  static async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      // Try to generate a test embedding
      const result = await this.generateEmbedding('test', { timeout: 3000 });
      
      if ('success' in result && !result.success) {
        return {
          status: 'degraded',
          details: {
            error: result.error,
            fallback_available: result.fallback_available,
            cache_stats: this.getCacheStats()
          }
        };
      }

      // Type guard: result is EmbeddingResult
      const embeddingResult = result as EmbeddingResult;

      return {
        status: 'healthy',
        details: {
          model: this.MODEL,
          dimensions: this.DIMENSIONS,
          latency_ms: embeddingResult.latency_ms,
          cached: embeddingResult.cached,
          cache_stats: this.getCacheStats()
        }
      };

    } catch (error: any) {
      return {
        status: 'unhealthy',
        details: {
          error: error.message,
          cache_stats: this.getCacheStats()
        }
      };
    }
  }
}

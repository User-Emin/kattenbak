/**
 * EMBEDDINGS SERVICE
 * Generate vector embeddings for text using sentence-transformers
 * Model: all-MiniLM-L6-v2 (384 dimensions)
 */

import crypto from 'crypto';

// Use Python sentence-transformers via child process (more reliable than JS libs)
import { spawn } from 'child_process';
import path from 'path';

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  dimensions: number;
}

export class EmbeddingsService {
  private static readonly MODEL = 'intfloat/multilingual-e5-base'; // BEST for Dutch
  private static readonly DIMENSIONS = 5; // ✅ FAST MOCK: Match vector store dimensions
  
  /**
   * Generate embedding for text
   * ✅ FAST MOCK for testing (no HuggingFace API)
   */
  static async generateEmbedding(text: string): Promise<EmbeddingResult> {
    try {
      // ✅ INSTANT: Generate deterministic embedding from text hash
      const hash = this.calculateHash(text);
      const embedding = this.hashToEmbedding(hash);
      
      return {
        embedding,
        model: 'mock-fast-v1',
        dimensions: this.DIMENSIONS,
      };
    } catch (err: any) {
      console.error('Embeddings generation error:', err.message);
      throw new Error(`Failed to generate embedding: ${err.message}`);
    }
  }
  
  /**
   * Convert hash to embedding vector (deterministic)
   */
  private static hashToEmbedding(hash: string): number[] {
    const embedding: number[] = [];
    for (let i = 0; i < this.DIMENSIONS; i++) {
      const byte = parseInt(hash.substring((i * 2) % hash.length, (i * 2 + 2) % hash.length) || '00', 16);
      embedding.push((byte / 255) * 2 - 1); // Normalize to [-1, 1]
    }
    return embedding;
  }

  /**
   * Generate embeddings for multiple texts (batch)
   */
  static async generateBatchEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = [];
    
    // Process in batches of 10 for performance
    const batchSize = 10;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(text => this.generateEmbedding(text))
      );
      results.push(...batchResults);
      
      // Log progress
      console.log(`Embeddings: ${results.length}/${texts.length} generated`);
    }
    
    return results;
  }

  /**
   * Calculate content hash for deduplication
   */
  static calculateHash(content: string): string {
    return crypto
      .createHash('sha256')
      .update(content.trim().toLowerCase())
      .digest('hex');
  }

  /**
   * Sanitize text before embedding
   * SECURITY: Remove potential injection attempts
   */
  private static sanitizeText(text: string): string {
    if (!text) return '';
    
    return text
      .trim()
      .substring(0, 8000) // Max length
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
      .replace(/\s+/g, ' '); // Normalize whitespace
  }

  /**
   * Call Python embeddings script
   * Uses sentence-transformers library
   */
  private static async callPythonEmbeddings(text: string): Promise<number[]> {
    return new Promise((resolve, reject) => {
      // 🔒 SECURITY: Validate script path (prevent path traversal)
      const scriptPath = path.join(__dirname, '../../../scripts/generate_embedding.py');
      const resolvedPath = path.resolve(scriptPath);
      const scriptsDir = path.resolve(path.join(__dirname, '../../../scripts'));
      
      // Ensure script is within scripts directory (prevent path traversal)
      if (!resolvedPath.startsWith(scriptsDir)) {
        reject(new Error('Invalid script path (security check failed)'));
        return;
      }
      
      // 🔒 SECURITY: Validate script exists
      if (!require('fs').existsSync(resolvedPath)) {
        reject(new Error('Python script not found'));
        return;
      }
      
      // 🔒 SECURITY: Sanitize input (prevent command injection)
      const sanitizedText = this.sanitizeText(text);
      
      const python = spawn('python3', [resolvedPath, sanitizedText], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: false // 🔒 SECURITY: Disable shell to prevent injection
      });
      
      let stdout = '';
      let stderr = '';
      
      python.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      python.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      python.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python script failed: ${stderr}`));
          return;
        }
        
        try {
          const embedding = JSON.parse(stdout);
          
          // Validate embedding
          if (!Array.isArray(embedding) || embedding.length !== this.DIMENSIONS) {
            reject(new Error(`Invalid embedding dimensions: ${embedding?.length}`));
            return;
          }
          
          resolve(embedding);
        } catch (err) {
          reject(new Error(`Failed to parse embedding: ${err}`));
        }
      });
      
      // Timeout after 60 seconds (model download on first use)
      setTimeout(() => {
        python.kill();
        reject(new Error('Embedding generation timeout'));
      }, 60000);
    });
  }
}

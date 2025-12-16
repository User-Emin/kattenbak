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
  private static readonly MODEL = 'all-MiniLM-L6-v2';
  private static readonly DIMENSIONS = 384;
  
  /**
   * Generate embedding for text
   * DEFENSIVE: Handles errors gracefully
   */
  static async generateEmbedding(text: string): Promise<EmbeddingResult> {
    try {
      // Sanitize input
      const sanitized = this.sanitizeText(text);
      
      if (!sanitized || sanitized.length === 0) {
        throw new Error('Empty text after sanitization');
      }

      // Generate embedding using Python script
      const embedding = await this.callPythonEmbeddings(sanitized);
      
      return {
        embedding,
        model: this.MODEL,
        dimensions: this.DIMENSIONS,
      };
    } catch (err: any) {
      console.error('Embeddings generation error:', err.message);
      throw new Error(`Failed to generate embedding: ${err.message}`);
    }
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
      const scriptPath = path.join(__dirname, '../../../scripts/generate_embedding.py');
      
      const python = spawn('python3', [scriptPath, text]);
      
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
      
      // Timeout after 10 seconds
      setTimeout(() => {
        python.kill();
        reject(new Error('Embedding generation timeout'));
      }, 10000);
    });
  }
}

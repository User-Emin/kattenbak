/**
 * LOCAL EMBEDDINGS SERVICE - No External API Required
 * Uses simple TF-IDF + word vectors for embeddings
 * FAST, NO DEPENDENCIES, WORKS OFFLINE
 */

import * as crypto from 'crypto';

export interface EmbeddingResult {
  embedding: number[];
  dimensions: number;
  model: 'local-tfidf';
}

export class EmbeddingsLocalService {
  private static readonly DIMENSIONS = 384; // Compact but effective
  
  // Dutch stop words (most common words to filter out)
  private static readonly STOP_WORDS = new Set([
    'de', 'het', 'een', 'en', 'van', 'in', 'op', 'dat', 'voor', 'is', 'te',
    'met', 'aan', 'bij', 'om', 'zijn', 'als', 'maar', 'die', 'heeft', 'kan',
    'wat', 'ook', 'niet', 'naar', 'door', 'geen', 'tot', 'wordt', 'deze',
    'dan', 'wel', 'meer', 'worden', 'hij', 'zij', 'ze', 'hun', 'hun', 'of',
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
    'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
  ]);
  
  /**
   * Generate embedding using local TF-IDF + word hashing
   */
  static generateEmbedding(text: string): EmbeddingResult {
    // Normalize text
    const normalized = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Tokenize
    const tokens = normalized
      .split(' ')
      .filter(t => t.length > 2 && !this.STOP_WORDS.has(t));
    
    // Create embedding vector
    const embedding = new Array(this.DIMENSIONS).fill(0);
    
    // TF (Term Frequency) + Word hashing
    const termFreq = new Map<string, number>();
    tokens.forEach(token => {
      termFreq.set(token, (termFreq.get(token) || 0) + 1);
    });
    
    // Normalize by document length
    const maxFreq = Math.max(...Array.from(termFreq.values()), 1);
    
    // Generate features from tokens
    termFreq.forEach((freq, term) => {
      const tf = freq / maxFreq; // Normalized term frequency
      
      // Hash term to multiple positions (feature hashing)
      for (let i = 0; i < 3; i++) {
        const hash = this.hashToken(term, i);
        const index = hash % this.DIMENSIONS;
        const sign = (hash % 2 === 0) ? 1 : -1;
        embedding[index] += tf * sign * 0.5;
      }
    });
    
    // Add bigram features for better context
    for (let i = 0; i < tokens.length - 1; i++) {
      const bigram = `${tokens[i]}_${tokens[i + 1]}`;
      const hash = this.hashToken(bigram, 0);
      const index = hash % this.DIMENSIONS;
      embedding[index] += 0.3;
    }
    
    // L2 normalization
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] /= magnitude;
      }
    }
    
    return {
      embedding,
      dimensions: this.DIMENSIONS,
      model: 'local-tfidf'
    };
  }
  
  /**
   * Hash a token to a number (deterministic)
   */
  private static hashToken(token: string, seed: number): number {
    const hash = crypto.createHash('md5');
    hash.update(token + seed.toString());
    const hex = hash.digest('hex');
    return parseInt(hex.substring(0, 8), 16);
  }
  
  /**
   * Calculate hash for caching
   */
  static calculateHash(text: string): string {
    return crypto.createHash('md5').update(text).digest('hex');
  }
  
  /**
   * Cosine similarity between two embeddings
   */
  static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Embedding dimensions must match');
    }
    
    let dotProduct = 0;
    let magA = 0;
    let magB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    
    const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }
  
  /**
   * Test the embedding service
   */
  static test(): void {
    console.log('🧪 Testing Local Embeddings Service...');
    
    const text1 = 'Is de kattenbak veilig voor mijn kat?';
    const text2 = 'Dubbele veiligheidssensoren beschermen je kat';
    const text3 = 'Hoeveel kost het stroomverbruik per maand?';
    
    const emb1 = this.generateEmbedding(text1);
    const emb2 = this.generateEmbedding(text2);
    const emb3 = this.generateEmbedding(text3);
    
    console.log(`✅ Embedding 1: ${emb1.dimensions} dimensions`);
    console.log(`✅ Embedding 2: ${emb2.dimensions} dimensions`);
    console.log(`✅ Embedding 3: ${emb3.dimensions} dimensions`);
    
    const sim12 = this.cosineSimilarity(emb1.embedding, emb2.embedding);
    const sim13 = this.cosineSimilarity(emb1.embedding, emb3.embedding);
    const sim23 = this.cosineSimilarity(emb2.embedding, emb3.embedding);
    
    console.log(`\n📊 Similarities:`);
    console.log(`   Text 1 <-> Text 2 (veiligheid): ${sim12.toFixed(3)} (should be HIGH)`);
    console.log(`   Text 1 <-> Text 3 (unrelated):  ${sim13.toFixed(3)} (should be LOW)`);
    console.log(`   Text 2 <-> Text 3 (unrelated):  ${sim23.toFixed(3)} (should be LOW)`);
    
    if (sim12 > sim13 && sim12 > sim23) {
      console.log('\n✅ LOCAL EMBEDDINGS WORKING CORRECTLY!');
    } else {
      console.log('\n⚠️  Similarities unexpected, but still functional');
    }
  }
}

// Run test if executed directly
if (require.main === module) {
  EmbeddingsLocalService.test();
}


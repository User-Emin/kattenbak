/**
 * IN-MEMORY VECTOR STORE
 * Alternative to pgvector for immediate deployment
 * Suitable for <1000 documents
 * 
 * TEAM DECISION: Use this instead of pgvector due to AlmaLinux packaging issues
 * Can upgrade to pgvector later when package available
 */

import * as fs from 'fs';
import * as path from 'path';

export interface VectorDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: any;
  type: string;
}

export class VectorStoreService {
  private static documents: VectorDocument[] = [];
  // Path: dist/services/rag -> dist/data (go up 2 levels)
  private static readonly STORE_PATH = path.join(__dirname, '../../data/vector-store.json');
  
  /**
   * Initialize vector store
   */
  static async initialize(): Promise<void> {
    try {
      if (fs.existsSync(this.STORE_PATH)) {
        const data = fs.readFileSync(this.STORE_PATH, 'utf-8');
        const parsed = JSON.parse(data);
        
        // Handle both old format (array) and new format (object with documents key)
        if (Array.isArray(parsed)) {
          this.documents = parsed;
        } else if (parsed.documents && Array.isArray(parsed.documents)) {
          this.documents = parsed.documents;
        } else {
          throw new Error('Invalid vector store format');
        }
        
        console.log(`✅ Vector store loaded: ${this.documents.length} documents`);
      } else {
        console.log('ℹ️  Vector store empty - run ingestion');
      }
    } catch (err: any) {
      console.error('Vector store initialization error:', err.message);
      this.documents = [];
    }
  }
  
  /**
   * Add document to store
   */
  static async addDocument(doc: VectorDocument): Promise<void> {
    // Check for duplicates
    const existing = this.documents.findIndex(d => d.id === doc.id);
    
    if (existing >= 0) {
      this.documents[existing] = doc;
    } else {
      this.documents.push(doc);
    }
    
    // Persist to disk
    await this.save();
  }
  
  /**
   * Add multiple documents
   */
  static async addDocuments(docs: VectorDocument[]): Promise<void> {
    for (const doc of docs) {
      await this.addDocument(doc);
    }
    console.log(`✅ Added ${docs.length} documents to vector store`);
  }
  
  /**
   * Cosine similarity search
   */
  static async similaritySearch(
    queryEmbedding: number[],
    maxResults: number = 5,
    threshold: number = 0.65
  ): Promise<Array<{
    id: string;
    content: string;
    similarity: number;
    metadata: any;
  }>> {
    // Calculate cosine similarity for all documents
    const results = this.documents.map(doc => ({
      id: doc.id,
      content: doc.content,
      metadata: doc.metadata,
      similarity: this.cosineSimilarity(queryEmbedding, doc.embedding)
    }));
    
    // Filter by threshold and sort by similarity
    return results
      .filter(r => r.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxResults);
  }
  
  /**
   * Calculate cosine similarity
   */
  private static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have same dimensions');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (normA * normB);
  }
  
  /**
   * Clear all documents
   */
  static async clear(): Promise<void> {
    this.documents = [];
    await this.save();
    console.log('✅ Vector store cleared');
  }
  
  /**
   * Get all documents (for keyword search)
   */
  static getAllDocuments(): any[] {
    return this.documents;
  }
  
  /**
   * Get document count
   */
  static getCount(): number {
    return this.documents.length;
  }
  
  /**
   * Save to disk
   */
  private static async save(): Promise<void> {
    try {
      const dir = path.dirname(this.STORE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(
        this.STORE_PATH,
        JSON.stringify(this.documents, null, 2),
        'utf-8'
      );
    } catch (err: any) {
      console.error('Failed to save vector store:', err.message);
    }
  }
}

// Initialize on import
VectorStoreService.initialize();

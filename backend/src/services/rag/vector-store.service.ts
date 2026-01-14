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
  private static initialized = false; // ✅ FIX: Track initialization state
  // ✅ FIX: Absolute path from project root (works in both dev and production)
  private static readonly STORE_PATH = process.env.VECTOR_STORE_PATH || 
    path.join(process.cwd(), 'data', 'vector-store.json');
  
  // ✅ MEMORY LIMIT: Prevent overloading (max 1000 documents in memory)
  private static readonly MAX_DOCUMENTS = parseInt(process.env.RAG_MAX_DOCUMENTS || '1000', 10);
  
  /**
   * ✅ LAZY LOADING: Ensure initialized only when needed
   */
  static async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
      this.initialized = true;
    }
  }
  
  /**
   * Initialize vector store (PRIVATE - use ensureInitialized())
   * ✅ MEMORY LIMIT: Only load first MAX_DOCUMENTS to prevent overloading
   */
  private static async initialize(): Promise<void> {
    try {
      if (fs.existsSync(this.STORE_PATH)) {
        const data = fs.readFileSync(this.STORE_PATH, 'utf-8');
        const parsed = JSON.parse(data);
        
        // Handle both old format (array) and new format (object with documents key)
        let allDocs: VectorDocument[] = [];
        if (Array.isArray(parsed)) {
          allDocs = parsed;
        } else if (parsed.documents && Array.isArray(parsed.documents)) {
          allDocs = parsed.documents;
        } else {
          throw new Error('Invalid vector store format');
        }
        
        // ✅ MEMORY LIMIT: Only keep first MAX_DOCUMENTS (prevents CPU/memory overload)
        if (allDocs.length > this.MAX_DOCUMENTS) {
          console.warn(`⚠️  Vector store has ${allDocs.length} documents, limiting to ${this.MAX_DOCUMENTS} to prevent overloading`);
          this.documents = allDocs.slice(0, this.MAX_DOCUMENTS);
        } else {
          this.documents = allDocs;
        }
        
        console.log(`✅ Vector store loaded: ${this.documents.length} documents (max: ${this.MAX_DOCUMENTS})`);
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
   * ✅ PERFORMANCE: Early termination if too many documents (prevents CPU overload)
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
    // ✅ PERFORMANCE: Limit search to first 500 documents if too many (prevents CPU overload)
    const searchLimit = this.documents.length > 500 ? 500 : this.documents.length;
    const docsToSearch = this.documents.slice(0, searchLimit);
    
    // Calculate cosine similarity for documents (limited set)
    const results = docsToSearch.map(doc => ({
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

// ❌ REMOVED: Auto-initialize on import (causes unnecessary startup delay)
// Call VectorStoreService.ensureInitialized() in routes instead
// VectorStoreService.initialize();

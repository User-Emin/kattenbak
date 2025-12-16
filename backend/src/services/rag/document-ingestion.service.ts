/**
 * DOCUMENT INGESTION SERVICE  
 * Load product specifications into IN-MEMORY vector store
 * No PostgreSQL/pgvector needed
 */

import { EmbeddingsService } from './embeddings.service';
import { VectorStoreService, VectorDocument } from './vector-store.service';
import * as fs from 'fs';
import * as path from 'path';

interface ProductDocument {
  type: string;
  title: string;
  content: string;
  keywords: string[];
  importance: string;
}

interface ProductSpecifications {
  product_id: string;
  sku: string;
  documents: ProductDocument[];
}

export class DocumentIngestionService {
  /**
   * Ingest all product specifications
   */
  static async ingestProductSpecifications(): Promise<void> {
    console.log('🔄 Starting document ingestion (IN-MEMORY)...');
    
    const specsPath = path.join(__dirname, '../../data/product-specifications.json');
    const specsData: ProductSpecifications = JSON.parse(
      fs.readFileSync(specsPath, 'utf-8')
    );
    
    console.log(`📄 Found ${specsData.documents.length} documents for product ${specsData.sku}`);
    
    const vectorDocs: VectorDocument[] = [];
    
    for (const doc of specsData.documents) {
      try {
        // Generate content hash for ID
        const contentHash = EmbeddingsService.calculateHash(doc.content);
        const docId = `doc_${contentHash.substring(0, 12)}`;
        
        // Generate embedding
        console.log(`🔮 Generating embedding for: ${doc.title}`);
        const { embedding } = await EmbeddingsService.generateEmbedding(doc.content);
        
        // Create vector document
        const vectorDoc: VectorDocument = {
          id: docId,
          content: doc.content,
          embedding,
          metadata: {
            title: doc.title,
            keywords: doc.keywords,
            importance: doc.importance,
            sku: specsData.sku,
            product_id: specsData.product_id,
            type: doc.type
          },
          type: doc.type
        };
        
        vectorDocs.push(vectorDoc);
        console.log(`✅ Prepared: ${doc.title}`);
        
      } catch (err: any) {
        console.error(`❌ Failed to prepare ${doc.title}:`, err.message);
      }
    }
    
    // Add all documents to vector store
    await VectorStoreService.addDocuments(vectorDocs);
    
    console.log('');
    console.log('========================================');
    console.log('📊 INGESTION COMPLETE');
    console.log('========================================');
    console.log(`✅ Ingested: ${vectorDocs.length} documents`);
    console.log(`💾 Storage: IN-MEMORY + File persistence`);
    console.log('========================================');
  }
  
  /**
   * Clear all documents (for re-ingestion)
   */
  static async clearDocuments(): Promise<void> {
    console.log('🗑️  Clearing all documents...');
    
    await VectorStoreService.clear();
    
    console.log('✅ All documents cleared');
  }
  
  /**
   * Get document count
   */
  static async getDocumentCount(): Promise<number> {
    return VectorStoreService.getCount();
  }
}

// CLI commands
if (require.main === module) {
  const command = process.argv[2];
  
  (async () => {
    try {
      if (command === 'ingest') {
        await DocumentIngestionService.ingestProductSpecifications();
      } else if (command === 'clear') {
        await DocumentIngestionService.clearDocuments();
      } else if (command === 'count') {
        const count = await DocumentIngestionService.getDocumentCount();
        console.log(`📊 Document count: ${count}`);
      } else {
        console.log('Usage: ts-node document-ingestion.service.ts [ingest|clear|count]');
      }
    } catch (err: any) {
      console.error('❌ Error:', err.message);
      process.exit(1);
    }
  })();
}

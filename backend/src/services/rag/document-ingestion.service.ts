/**
 * DOCUMENT INGESTION SERVICE
 * Load product specifications into vector database
 */

import { PrismaClient } from '@prisma/client';
import { EmbeddingsService } from './embeddings.service';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

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
    console.log('🔄 Starting document ingestion...');
    
    const specsPath = path.join(__dirname, '../../data/product-specifications.json');
    const specsData: ProductSpecifications = JSON.parse(
      fs.readFileSync(specsPath, 'utf-8')
    );
    
    console.log(`📄 Found ${specsData.documents.length} documents for product ${specsData.sku}`);
    
    let ingested = 0;
    let skipped = 0;
    
    for (const doc of specsData.documents) {
      try {
        // Generate content hash for deduplication
        const contentHash = EmbeddingsService.calculateHash(doc.content);
        
        // Check if already exists
        const existing = await prisma.$queryRaw`
          SELECT id FROM document_embeddings WHERE content_hash = ${contentHash}
        `;
        
        if (Array.isArray(existing) && existing.length > 0) {
          console.log(`⏭️  Skipping duplicate: ${doc.title}`);
          skipped++;
          continue;
        }
        
        // Generate embedding
        console.log(`🔮 Generating embedding for: ${doc.title}`);
        const { embedding } = await EmbeddingsService.generateEmbedding(doc.content);
        
        // Store in database
        await prisma.$executeRaw`
          INSERT INTO document_embeddings (
            document_type,
            product_id,
            content,
            content_hash,
            embedding,
            metadata
          ) VALUES (
            ${doc.type},
            ${specsData.product_id},
            ${doc.content},
            ${contentHash},
            ${`[${embedding.join(',')}]`}::vector,
            ${JSON.stringify({
              title: doc.title,
              keywords: doc.keywords,
              importance: doc.importance,
              sku: specsData.sku
            })}
          )
        `;
        
        console.log(`✅ Ingested: ${doc.title}`);
        ingested++;
        
      } catch (err: any) {
        console.error(`❌ Failed to ingest ${doc.title}:`, err.message);
      }
    }
    
    console.log('');
    console.log('========================================');
    console.log('📊 INGESTION COMPLETE');
    console.log('========================================');
    console.log(`✅ Ingested: ${ingested} documents`);
    console.log(`⏭️  Skipped: ${skipped} duplicates`);
    console.log('========================================');
  }
  
  /**
   * Clear all documents (for re-ingestion)
   */
  static async clearDocuments(): Promise<void> {
    console.log('🗑️  Clearing all documents...');
    
    await prisma.$executeRaw`
      DELETE FROM document_embeddings
    `;
    
    console.log('✅ All documents cleared');
  }
  
  /**
   * Get document count
   */
  static async getDocumentCount(): Promise<number> {
    const result = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*)::int as count FROM document_embeddings
    `;
    
    return Number(result[0].count);
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
    } finally {
      await prisma.$disconnect();
    }
  })();
}

#!/usr/bin/env node

/**
 * ✅ COMPLETE RAG INGESTION - SECURE & CPU-FRIENDLY
 * Ingest complete product information with local embeddings
 * DRY: No redundancy, no hardcoding, security compliant
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ✅ SECURITY: Use environment variables, no hardcoding
const SPECS_PATH = process.env.PRODUCT_SPECS_PATH || 
  path.join(__dirname, '../src/data/product-specifications-complete-rag.json');
const VECTOR_STORE_PATH = process.env.VECTOR_STORE_PATH || 
  path.join(__dirname, '../data/vector-store.json');

// ✅ DRY: Local embeddings implementation (no TypeScript import needed)

// ✅ DRY: Local embeddings (same as EmbeddingsLocalService)
class LocalEmbeddings {
  static DIMENSIONS = 384;
  static STOP_WORDS = new Set([
    'de', 'het', 'een', 'en', 'van', 'in', 'op', 'dat', 'voor', 'is', 'te',
    'met', 'aan', 'bij', 'om', 'zijn', 'als', 'maar', 'die', 'heeft', 'kan',
    'wat', 'ook', 'niet', 'naar', 'door', 'geen', 'tot', 'wordt', 'deze',
    'dan', 'wel', 'meer', 'worden', 'hij', 'zij', 'ze', 'hun', 'of',
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
    'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
  ]);
  
  static hashToken(token, seed) {
    const hash = crypto.createHash('md5');
    hash.update(token + seed.toString());
    const hex = hash.digest('hex');
    return parseInt(hex.substring(0, 8), 16);
  }
  
  static generateEmbedding(text) {
    const normalized = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const tokens = normalized
      .split(' ')
      .filter(t => t.length > 2 && !this.STOP_WORDS.has(t));
    
    const embedding = new Array(this.DIMENSIONS).fill(0);
    const termFreq = new Map();
    
    tokens.forEach(token => {
      termFreq.set(token, (termFreq.get(token) || 0) + 1);
    });
    
    const maxFreq = Math.max(...Array.from(termFreq.values()), 1);
    
    termFreq.forEach((freq, term) => {
      const tf = freq / maxFreq;
      for (let i = 0; i < 3; i++) {
        const hash = this.hashToken(term, i);
        const index = hash % this.DIMENSIONS;
        const sign = (hash % 2 === 0) ? 1 : -1;
        embedding[index] += tf * sign * 0.5;
      }
    });
    
    for (let i = 0; i < tokens.length - 1; i++) {
      const bigram = `${tokens[i]}_${tokens[i + 1]}`;
      const hash = this.hashToken(bigram, 0);
      const index = hash % this.DIMENSIONS;
      embedding[index] += 0.3;
    }
    
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
}

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║  COMPLETE RAG INGESTION - SECURE & CPU-FRIENDLY        ║');
console.log('╚════════════════════════════════════════════════════════╝');
console.log('');

// Load specifications
if (!fs.existsSync(SPECS_PATH)) {
  console.error(`❌ Product specifications not found: ${SPECS_PATH}`);
  process.exit(1);
}

const specs = JSON.parse(fs.readFileSync(SPECS_PATH, 'utf-8'));
console.log(`📄 Found ${specs.documents.length} documents for product ${specs.sku}`);
console.log('');

const vectorDocs = [];

// ✅ DRY: Process document function
async function processDocument(doc, index) {
  console.log(`🔮 [${index + 1}/${specs.documents.length}] ${doc.title}`);
  
  try {
    // ✅ SECURITY: Generate embedding using local service (no Python spawn)
    const embeddingResult = LocalEmbeddings.generateEmbedding(doc.content);
    
    if (!embeddingResult || !embeddingResult.embedding) {
      console.error(`   ❌ Embedding generation failed`);
      return null;
    }
    
    // ✅ DRY: Generate content hash for ID (consistent with backend)
    const contentHash = crypto.createHash('sha256')
      .update(doc.content.toLowerCase().trim())
      .digest('hex')
      .substring(0, 12);
    
    const vectorDoc = {
      id: `doc_${contentHash}`,
      content: doc.content,
      embedding: embeddingResult.embedding,
      metadata: {
        title: doc.title,
        keywords: doc.keywords,
        importance: doc.importance,
        sku: specs.sku,
        product_id: specs.product_id,
        type: doc.type
      },
      type: doc.type
    };
    
    console.log(`   ✅ Embedded (${embeddingResult.dimensions}D, model: ${embeddingResult.model})`);
    return vectorDoc;
    
  } catch (err) {
    console.error(`   ❌ Error: ${err.message}`);
    return null;
  }
}

// ✅ CPU-FRIENDLY: Process documents sequentially with small delay
async function ingestDocuments() {
  console.log('🔄 Starting ingestion (CPU-friendly)...\n');
  
  for (let i = 0; i < specs.documents.length; i++) {
    const doc = await processDocument(specs.documents[i], i);
    if (doc) {
      vectorDocs.push(doc);
    }
    
    // ✅ CPU-FRIENDLY: Small delay to prevent overload
    if (i < specs.documents.length - 1) {
      await new Promise(r => setTimeout(r, 50));
    }
  }
  
  // ✅ DRY: Save to file
  const dir = path.dirname(VECTOR_STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(
    VECTOR_STORE_PATH,
    JSON.stringify(vectorDocs, null, 2),
    'utf-8'
  );
  
  console.log('');
  console.log('========================================');
  console.log('📊 INGESTION COMPLETE');
  console.log('========================================');
  console.log(`✅ Documents ingested: ${vectorDocs.length}`);
  console.log(`💾 Saved to: ${VECTOR_STORE_PATH}`);
  console.log(`📊 Total size: ${(fs.statSync(VECTOR_STORE_PATH).size / 1024).toFixed(2)} KB`);
  console.log('========================================');
  console.log('');
  console.log('✅ Ready for RAG queries!');
}

// Run ingestion
ingestDocuments().catch(err => {
  console.error('❌ Ingestion error:', err);
  process.exit(1);
});

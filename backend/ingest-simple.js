/**
 * SIMPLE DOCUMENT INGESTION
 * Pure Node.js - no TypeScript/tsx needed
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Load specifications
const specsPath = path.join(__dirname, 'src/data/product-specifications.json');
const specs = JSON.parse(fs.readFileSync(specsPath, 'utf-8'));

console.log(`📄 Found ${specs.documents.length} documents`);

// Vector store path
const vectorStorePath = path.join(__dirname, 'data/vector-store.json');
const vectorDocs = [];

// Process each document
async function processDocument(doc, index) {
  console.log(`🔮 [${index + 1}/${specs.documents.length}] ${doc.title}`);
  
  return new Promise((resolve, reject) => {
    // 🔒 SECURITY: Validate script path
    const scriptPath = path.join(__dirname, 'scripts/generate_embedding.py');
    const resolvedPath = path.resolve(scriptPath);
    const scriptsDir = path.resolve(path.join(__dirname, 'scripts'));
    
    // Ensure script is within scripts directory
    if (!resolvedPath.startsWith(scriptsDir)) {
      reject(new Error('Invalid script path (security check failed)'));
      return;
    }
    
    // 🔒 SECURITY: Validate script exists
    if (!fs.existsSync(resolvedPath)) {
      reject(new Error('Python script not found'));
      return;
    }
    
    // 🔒 SECURITY: Sanitize content (prevent command injection)
    const sanitizedContent = doc.content.replace(/[;&|`$(){}[\]<>]/g, '');
    
    const python = spawn('python3', [resolvedPath, sanitizedContent], {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: false // 🔒 SECURITY: Disable shell
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
        console.error(`   ❌ Failed: ${stderr}`);
        resolve(null);
        return;
      }
      
      try {
        const embedding = JSON.parse(stdout);
        
        // Create hash for ID
        const crypto = require('crypto');
        const hash = crypto.createHash('sha256')
          .update(doc.content.toLowerCase().trim())
          .digest('hex')
          .substring(0, 12);
        
        const vectorDoc = {
          id: `doc_${hash}`,
          content: doc.content,
          embedding,
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
        
        console.log(`   ✅ Embedded`);
        resolve(vectorDoc);
      } catch (err) {
        console.error(`   ❌ Parse error: ${err.message}`);
        resolve(null);
      }
    });
    
    setTimeout(() => {
      python.kill();
      console.error(`   ❌ Timeout`);
      resolve(null);
    }, 30000);
  });
}

// Main ingestion
async function ingest() {
  console.log('🔄 Starting ingestion...\n');
  
  for (let i = 0; i < specs.documents.length; i++) {
    const doc = await processDocument(specs.documents[i], i);
    if (doc) {
      vectorDocs.push(doc);
    }
    
    // Small delay to prevent overwhelming
    await new Promise(r => setTimeout(r, 100));
  }
  
  // Save to file
  const dir = path.dirname(vectorStorePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(
    vectorStorePath,
    JSON.stringify(vectorDocs, null, 2),
    'utf-8'
  );
  
  console.log('\n========================================');
  console.log('📊 INGESTION COMPLETE');
  console.log('========================================');
  console.log(`✅ Documents ingested: ${vectorDocs.length}`);
  console.log(`💾 Saved to: ${vectorStorePath}`);
  console.log('========================================\n');
}

ingest().catch(err => {
  console.error('❌ Ingestion error:', err);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * COMPLETE DATA INGESTION
 * Ingest nieuwe productdata uit product-specifications-complete.json
 * Met alle 10 RAG technieken toegepast
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const COMPLETE_SPECS_PATH = path.join(__dirname, '../src/data/product-specifications-complete.json');
const VECTOR_STORE_PATH = path.join(__dirname, '../data/vector-store.json');
const PYTHON_SCRIPT = path.join(__dirname, 'generate_embedding.py');

console.log('╔══════════════════════════════════════════════════╗');
console.log('║  COMPLETE PRODUCT DATA INGESTION                 ║');
console.log('║  Met 10 RAG Advanced Techniques                  ║');
console.log('╚══════════════════════════════════════════════════╝\n');

// Load complete specifications
const completeSpecs = JSON.parse(fs.readFileSync(COMPLETE_SPECS_PATH, 'utf-8'));

// Generate documents from structured data
const documents = [];
let docId = 1;

console.log('📝 Generating structured documents...\n');

// 1. Product Overview
documents.push({
  id: `doc_${docId++}`,
  content: `${completeSpecs.product.name}

Dit is een premium ${completeSpecs.product.category} van ${completeSpecs.product.brand}. 
${completeSpecs.comparison_advantages.value_proposition}

Unieke features: ${completeSpecs.comparison_advantages.unique_features.join(', ')}`,
  metadata: {
    title: 'Product Overzicht',
    category: 'product_overview',
    priority: 'high',
    keywords: ['automatisch', 'kattenbak', 'premium', 'zelfreinigend']
  }
});

// 2-13. Comparison Features (from screenshot data)
completeSpecs.comparison_table.features.forEach((feature, idx) => {
  let content = `${feature.feature}\n\n${feature.description}`;
  
  if (feature.advantage) {
    content += `\n\nVOORDEEL: ${feature.advantage}`;
  }
  
  if (feature.ours === true && typeof feature.competitor_1 !== 'string') {
    const competitors = [feature.competitor_1, feature.competitor_2].filter(c => !c);
    if (competitors.length > 0) {
      content += `\n\nONZE KATTENBAK: ✓ Ja`;
      content += `\nConcurrenten: ${competitors.length === 2 ? 'Beide' : 'Eén'} heeft dit niet`;
    }
  }
  
  // Add technical details if available
  if (feature.technical) content += `\n\nTechnisch: ${feature.technical}`;
  if (feature.filter_specs) {
    content += `\n\nFilter specificaties:\n- Type: ${feature.filter_specs.type}\n- Efficiëntie: ${feature.filter_specs.efficiency}\n- Levensduur: ${feature.filter_specs.lifespan}`;
  }
  if (feature.practical) {
    content += `\n\nPraktisch:\n- 1 kat: ${feature.practical.one_cat}\n- 2 katten: ${feature.practical.two_cats}`;
    if (feature.practical.three_cats) content += `\n- 3 katten: ${feature.practical.three_cats}`;
  }
  if (feature.app_features) {
    content += `\n\nApp functies:\n${feature.app_features.map(f => `- ${f}`).join('\n')}`;
  }
  if (feature.compatible_litter) {
    content += `\n\nCompatibele vulling:\n${feature.compatible_litter.map(l => `- ${l}`).join('\n')}`;
    if (feature.recommended) content += `\n\nAanbevolen: ${feature.recommended}`;
  }
  if (feature.dimensions) {
    content += `\n\nAfmetingen:\nExtern: ${feature.dimensions.external.length} x ${feature.dimensions.external.width} x ${feature.dimensions.external.height}\nIntern: ${feature.dimensions.internal.length} x ${feature.dimensions.internal.width} x ${feature.dimensions.internal.height}`;
  }
  if (feature.noise_comparison) {
    content += `\n\nGeluidsvergelijking:\n- Ons product: ${feature.noise_comparison.our_product}\n- Normaal gesprek: ${feature.noise_comparison.normal_conversation}\n- Fluisteren: ${feature.noise_comparison.whisper}`;
  }
  if (feature.replaceable_parts) {
    content += `\n\nVervangbare onderdelen:\n${feature.replaceable_parts.map(p => `- ${p}`).join('\n')}`;
  }
  
  documents.push({
    id: `doc_${docId++}`,
    content,
    metadata: {
      title: feature.feature,
      category: feature.feature.toLowerCase().includes('safety') ? 'safety' : 
                feature.feature.toLowerCase().includes('app') ? 'app' :
                feature.feature.toLowerCase().includes('capacity') ? 'capacity' :
                'product_feature',
      priority: feature.advantage ? 'high' : 'medium',
      keywords: feature.feature.toLowerCase().split(' ').concat(
        feature.advantage ? ['voordeel', 'exclusief'] : []
      )
    }
  });
});

// 14. Technical Specifications
documents.push({
  id: `doc_${docId++}`,
  content: `Technische Specificaties

Voeding:
- Spanning: ${completeSpecs.technical_specifications.power.voltage}
- Frequentie: ${completeSpecs.technical_specifications.power.frequency}
- Verbruik: ${completeSpecs.technical_specifications.power.consumption}
- Kabellengte: ${completeSpecs.technical_specifications.power.cable_length}

Reinigingscyclus:
- Duur: ${completeSpecs.technical_specifications.cleaning_cycle.duration}
- Vertraging na gebruik: ${completeSpecs.technical_specifications.cleaning_cycle.delay_after_use}
- Methode: ${completeSpecs.technical_specifications.cleaning_cycle.method}

Sensoren:
- Primair: ${completeSpecs.technical_specifications.sensors.primary}
- Secundair: ${completeSpecs.technical_specifications.sensors.secondary}
- Reactietijd: ${completeSpecs.technical_specifications.sensors.safety_stop}

Gewicht: ${completeSpecs.technical_specifications.weight.product}`,
  metadata: {
    title: 'Technische Specificaties',
    category: 'technical',
    priority: 'medium',
    keywords: ['specificaties', 'technisch', 'sensor', 'voeding', 'afmetingen']
  }
});

// 15. Setup & Installation
documents.push({
  id: `doc_${docId++}`,
  content: `Installatie en Gebruik

Installatietijd: ${completeSpecs.setup_and_usage.installation.time}

Stappen:
${completeSpecs.setup_and_usage.installation.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Vereisten:
${completeSpecs.setup_and_usage.installation.requirements.map(r => `- ${r}`).join('\n')}

Dagelijks gebruik:
- Vulling: ${completeSpecs.setup_and_usage.daily_use.litter_amount}
- Bijvullen: ${completeSpecs.setup_and_usage.daily_use.refill_frequency}
- Afval legen (1 kat): ${completeSpecs.setup_and_usage.daily_use.waste_emptying.one_cat}
- Afval legen (2 katten): ${completeSpecs.setup_and_usage.daily_use.waste_emptying.two_cats}`,
  metadata: {
    title: 'Setup en Installatie',
    category: 'setup',
    priority: 'high',
    keywords: ['installatie', 'gebruik', 'setup', 'starten']
  }
});

// 16. Cat Compatibility
documents.push({
  id: `doc_${docId++}`,
  content: `Geschiktheid voor Katten

Afmetingen geschikt voor:
- Minimum: ${completeSpecs.cat_compatibility.size.minimum}
- Ideaal: ${completeSpecs.cat_compatibility.size.ideal}
- Maximum: ${completeSpecs.cat_compatibility.size.maximum}

Aanpassingstijd: ${completeSpecs.cat_compatibility.behavior.adaptation_time}

Tips voor wennen:
${completeSpecs.cat_compatibility.behavior.tips.map(t => `- ${t}`).join('\n')}`,
  metadata: {
    title: 'Kat Geschiktheid',
    category: 'compatibility',
    priority: 'high',
    keywords: ['kat', 'geschikt', 'grote kat', 'kitten', 'aanpassen', 'wennen']
  }
});

// 17. Health Monitoring
documents.push({
  id: `doc_${docId++}`,
  content: `Gezondheidsmonitoring via App

Getrackte metrics:
${completeSpecs.health_monitoring.tracked_metrics.map(m => 
  `- ${m.metric}: ${m.importance} (Alert bij: ${m.alert_threshold})`
).join('\n')}

${completeSpecs.health_monitoring.veterinary_export}`,
  metadata: {
    title: 'Gezondheidsmonitoring',
    category: 'health',
    priority: 'medium',
    keywords: ['gezondheid', 'monitoring', 'app', 'dierenarts', 'tracking']
  }
});

// 18. Maintenance
documents.push({
  id: `doc_${docId++}`,
  content: `Onderhoud

Dagelijks: ${completeSpecs.setup_and_usage.maintenance.daily}
Wekelijks: ${completeSpecs.setup_and_usage.maintenance.weekly}
Maandelijks: ${completeSpecs.setup_and_usage.maintenance.monthly}
Per kwartaal: ${completeSpecs.setup_and_usage.maintenance.quarterly}
Jaarlijks: ${completeSpecs.setup_and_usage.maintenance.yearly}`,
  metadata: {
    title: 'Onderhoud',
    category: 'maintenance',
    priority: 'medium',
    keywords: ['onderhoud', 'schoonmaken', 'reinigen', 'filter']
  }
});

// 19. Pricing & Warranty
documents.push({
  id: `doc_${docId++}`,
  content: `Prijs en Garantie

Prijs: ${completeSpecs.pricing_and_warranty.price.retail}
Actie: ${completeSpecs.pricing_and_warranty.price.special_offer}

Inbegrepen:
${completeSpecs.pricing_and_warranty.included.map(i => `- ${i}`).join('\n')}

Garantie:
- Product: ${completeSpecs.pricing_and_warranty.warranty.product}
- Motor: ${completeSpecs.pricing_and_warranty.warranty.motor}
- Dekking: ${completeSpecs.pricing_and_warranty.warranty.coverage}`,
  metadata: {
    title: 'Prijs en Garantie',
    category: 'pricing',
    priority: 'high',
    keywords: ['prijs', 'kosten', 'garantie', 'actie', 'aanbieding']
  }
});

// 20. Customer Support
documents.push({
  id: `doc_${docId++}`,
  content: `Klantenservice & Ondersteuning

Beschikbaarheid:
- Telefoon: ${completeSpecs.support_and_service.customer_service.phone}
- Email: ${completeSpecs.support_and_service.customer_service.email}
- Chat: ${completeSpecs.support_and_service.customer_service.chat}

Resources:
${completeSpecs.support_and_service.resources.map(r => `- ${r}`).join('\n')}

Reserveonderdelen beschikbaar: ${completeSpecs.support_and_service.spare_parts.availability}`,
  metadata: {
    title: 'Klantenservice',
    category: 'support',
    priority: 'low',
    keywords: ['support', 'hulp', 'contact', 'service']
  }
});

// 21. Comparison Summary
documents.push({
  id: `doc_${docId++}`,
  content: `Waarom Kiezen voor Onze Automatische Kattenbak?

${completeSpecs.comparison_advantages.value_proposition}

7 EXCLUSIEVE FEATURES die concurrenten niet hebben:
${completeSpecs.comparison_advantages.unique_features.map((f, i) => `${i + 1}. ${f}`).join('\n')}

GROOTSTE afvalbak op de markt: 10.5L (vs 9L en 7L bij concurrenten)

Dit betekent:
- Minder vaak legen
- Meer convenience
- Beter voor meerdere katten
- Minder geur door grotere capaciteit`,
  metadata: {
    title: 'Waarom Kiezen Voor Ons',
    category: 'comparison_advantages',
    priority: 'high',
    keywords: ['voordeel', 'waarom', 'vergelijk', 'exclusief', 'beste', 'uniek']
  }
});

console.log(`✅ Generated ${documents.length} structured documents\n`);

// Generate embeddings for all documents
async function generateEmbedding(text) {
  return new Promise((resolve, reject) => {
    const python = spawn('python3', [PYTHON_SCRIPT, text]);
    let output = '';
    let error = '';
    
    python.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python error: ${error}`));
      } else {
        try {
          const embedding = JSON.parse(output.trim());
          resolve(embedding);
        } catch (err) {
          reject(new Error(`Parse error: ${err.message}`));
        }
      }
    });
  });
}

async function ingestDocuments() {
  const vectorStore = [];
  
  console.log('🔮 Generating embeddings (this may take a few minutes)...\n');
  
  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    process.stdout.write(`[${i + 1}/${documents.length}] ${doc.metadata.title}... `);
    
    try {
      const embedding = await generateEmbedding(doc.content);
      
      vectorStore.push({
        id: doc.id,
        content: doc.content,
        embedding,
        metadata: doc.metadata
      });
      
      console.log('✅');
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
    }
    
    // Small delay to be nice to system
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Save to vector store
  const vectorStoreData = {
    version: '2.0',
    model: 'intfloat/multilingual-e5-base',
    dimensions: 768,
    count: vectorStore.length,
    updated_at: new Date().toISOString(),
    documents: vectorStore
  };
  
  fs.writeFileSync(VECTOR_STORE_PATH, JSON.stringify(vectorStoreData, null, 2));
  
  console.log(`\n✅ Vector store saved: ${vectorStore.length} documents`);
  console.log(`📁 Location: ${VECTOR_STORE_PATH}`);
  
  return vectorStore.length;
}

// Run ingestion
ingestDocuments()
  .then((count) => {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log(`║  ✅ INGESTION COMPLETE: ${count} documents          ║`);
    console.log('╚══════════════════════════════════════════════════╝\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Ingestion failed:', err.message);
    process.exit(1);
  });

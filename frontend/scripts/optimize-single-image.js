/**
 * OPTIMIZE SINGLE IMAGE
 * Optimaliseert één PNG/JPG image naar WebP
 * Gebruik: node scripts/optimize-single-image.js <input-path> [output-path]
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGE_QUALITY = 85;
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;

async function optimizeImage(inputPath, outputPath) {
  try {
    if (!fs.existsSync(inputPath)) {
      console.error(`❌ Bestand niet gevonden: ${inputPath}`);
      return null;
    }

    const stats = fs.statSync(inputPath);
    const originalSize = stats.size;
    
    console.log(`📸 Optimaliseren: ${path.basename(inputPath)} (${(originalSize / 1024 / 1024).toFixed(2)} MB)`);
    
    await sharp(inputPath)
      .resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: IMAGE_QUALITY })
      .toFile(outputPath);
    
    const newStats = fs.statSync(outputPath);
    const newSize = newStats.size;
    const reduction = ((1 - newSize / originalSize) * 100).toFixed(1);
    
    console.log(`✅ Geoptimaliseerd: ${path.basename(outputPath)} (${(newSize / 1024 / 1024).toFixed(2)} MB) - ${reduction}% kleiner`);
    console.log(`📁 Locatie: ${outputPath}`);
    
    return { originalSize, newSize, reduction };
  } catch (error) {
    console.error(`❌ Fout bij optimaliseren:`, error.message);
    return null;
  }
}

// Main
const inputPath = process.argv[2];
const outputPath = process.argv[3] || inputPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');

if (!inputPath) {
  console.error('❌ Gebruik: node scripts/optimize-single-image.js <input-path> [output-path]');
  process.exit(1);
}

optimizeImage(inputPath, outputPath)
  .then(() => console.log('✅ Klaar!'))
  .catch(err => console.error('❌ Fout:', err));

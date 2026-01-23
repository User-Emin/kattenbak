/**
 * IMAGE OPTIMIZATION SCRIPT
 * Optimaliseert PNG/JPG images naar WebP met compressie
 * Gebruikt sharp voor image processing
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGE_QUALITY = 85;
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;

async function optimizeImage(inputPath, outputPath) {
  try {
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
    
    return { originalSize, newSize, reduction };
  } catch (error) {
    console.error(`❌ Fout bij optimaliseren ${inputPath}:`, error.message);
    return null;
  }
}

async function optimizeImagesInDirectory(dir) {
  const files = fs.readdirSync(dir);
  const imageExtensions = ['.png', '.jpg', '.jpeg'];
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const ext = path.extname(file).toLowerCase();
    
    if (imageExtensions.includes(ext)) {
      const outputPath = filePath.replace(ext, '.webp');
      await optimizeImage(filePath, outputPath);
    }
  }
}

// Main
const imagesDir = path.join(__dirname, '../public/images');
if (fs.existsSync(imagesDir)) {
  optimizeImagesInDirectory(imagesDir)
    .then(() => console.log('✅ Alle images geoptimaliseerd!'))
    .catch(err => console.error('❌ Fout:', err));
} else {
  console.error('❌ Images directory niet gevonden:', imagesDir);
}

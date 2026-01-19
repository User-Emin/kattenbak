#!/bin/bash

###############################################################################
# FIX PRODUCT DATA CONSISTENCY
# Zorgt dat admin en webshop dezelfde productdata gebruiken
# CPU-vriendelijk: geen rebuilds, alleen database updates
###############################################################################

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
  echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running on server
if [ -d "/var/www/kattenbak" ]; then
  SERVER_MODE=true
  BASE_DIR="/var/www/kattenbak"
else
  SERVER_MODE=false
  BASE_DIR="$(pwd)"
fi

log "🔧 Starting product data consistency fix..."

# Expected values (from webshop - correct values)
EXPECTED_NAME="ALP1071 Kattenbak"
EXPECTED_SKU="ALP1071"
EXPECTED_PRICE="219.95"
EXPECTED_SLUG="automatische-kattenbak-premium"

# Create fix script
cat > "$BASE_DIR/backend/fix-product-data.js" << 'EOF'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixProductData() {
  try {
    // Find product by slug
    const product = await prisma.product.findUnique({
      where: { slug: 'automatische-kattenbak-premium' },
      include: { variants: true }
    });

    if (!product) {
      console.log('❌ Product not found');
      return;
    }

    console.log('📊 Current product data:');
    console.log('  Name:', product.name);
    console.log('  SKU:', product.sku);
    console.log('  Price:', product.price.toString());
    console.log('  Variants:', product.variants.length);

    // Expected values
    const expectedName = 'ALP1071 Kattenbak';
    const expectedSku = 'ALP1071';
    const expectedPrice = 219.95;

    // Check if update needed
    let needsUpdate = false;
    if (product.name !== expectedName) {
      console.log(`⚠️  Name mismatch: "${product.name}" != "${expectedName}"`);
      needsUpdate = true;
    }
    if (product.sku !== expectedSku) {
      console.log(`⚠️  SKU mismatch: "${product.sku}" != "${expectedSku}"`);
      needsUpdate = true;
    }
    if (parseFloat(product.price.toString()) !== expectedPrice) {
      console.log(`⚠️  Price mismatch: ${product.price.toString()} != ${expectedPrice}`);
      needsUpdate = true;
    }

    if (needsUpdate) {
      console.log('🔧 Updating product data...');
      
      await prisma.product.update({
        where: { id: product.id },
        data: {
          name: expectedName,
          sku: expectedSku,
          price: expectedPrice,
        }
      });

      console.log('✅ Product data updated successfully');
    } else {
      console.log('✅ Product data is already correct');
    }

    // Verify variants
    console.log('\n📋 Variants:');
    product.variants.forEach(v => {
      console.log(`  - ${v.name} (${v.colorCode}) SKU: ${v.sku}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductData();
EOF

# Run fix script
if [ "$SERVER_MODE" = true ]; then
  log "Running fix on server..."
  cd "$BASE_DIR/backend"
  
  if [ -f "node_modules/@prisma/client/index.js" ] || [ -f "dist/node_modules/@prisma/client/index.js" ]; then
    node fix-product-data.js
    rm -f fix-product-data.js
    log "✅ Product data consistency fix completed"
  else
    warning "Prisma client not found - skipping database fix"
    warning "Please run this script after deployment or manually fix the database"
  fi
else
  log "Local mode - fix script created at: $BASE_DIR/backend/fix-product-data.js"
  log "Run this script on the server to fix product data consistency"
fi

log "✅ Fix script completed"

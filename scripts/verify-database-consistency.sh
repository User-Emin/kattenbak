#!/bin/bash

# ✅ DATABASE CONSISTENCY VERIFICATION SCRIPT
# Verifieert dat database data correct is en consistent
# Wordt uitgevoerd op de server na deployment

set -e

if [ ! -d "/var/www/kattenbak/backend" ]; then
  echo "❌ This script must be run on the production server"
  exit 1
fi

cd /var/www/kattenbak/backend

echo "🔍 DATABASE CONSISTENCY VERIFICATION - $(date)"
echo "=============================================="

# Create verification script
cat > verify-db-consistency.ts << 'EOF'
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const productSlug = "automatische-kattenbak-premium";
  
  console.log("🔍 Checking database consistency...");
  
  // Check for duplicate products
  const products = await prisma.product.findMany({
    where: { slug: productSlug },
    select: {
      id: true,
      name: true,
      sku: true,
      price: true,
      isActive: true,
    }
  });
  
  console.log(`\nFound ${products.length} product(s) with slug: ${productSlug}`);
  
  if (products.length > 1) {
    console.log("\n❌ ERROR: Multiple products with same slug!");
    products.forEach((p, i) => {
      console.log(`\n${i + 1}. ID: ${p.id}`);
      console.log(`   Name: ${p.name}`);
      console.log(`   SKU: ${p.sku}`);
      console.log(`   Price: €${p.price}`);
      console.log(`   Active: ${p.isActive}`);
    });
    console.log("\n⚠️  This will cause inconsistencies between admin and frontend!");
    process.exit(1);
  }
  
  if (products.length === 0) {
    console.log("\n❌ ERROR: No product found with slug: ${productSlug}");
    process.exit(1);
  }
  
  const product = products[0];
  
  // Verify expected values
  const EXPECTED_NAME = "ALP1071 Kattenbak";
  const EXPECTED_SKU = "ALP1071";
  const EXPECTED_PRICE = 219.95;
  
  console.log("\n✅ Product found:");
  console.log(`   ID: ${product.id}`);
  console.log(`   Name: ${product.name}`);
  console.log(`   SKU: ${product.sku}`);
  console.log(`   Price: €${product.price}`);
  
  let errors = 0;
  
  if (product.name !== EXPECTED_NAME) {
    console.log(`\n❌ Name mismatch: expected "${EXPECTED_NAME}", got "${product.name}"`);
    errors++;
  }
  
  if (product.sku !== EXPECTED_SKU) {
    console.log(`\n❌ SKU mismatch: expected "${EXPECTED_SKU}", got "${product.sku}"`);
    errors++;
  }
  
  const priceNum = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price);
  if (Math.abs(priceNum - EXPECTED_PRICE) > 0.01) {
    console.log(`\n❌ Price mismatch: expected €${EXPECTED_PRICE}, got €${priceNum}`);
    errors++;
  }
  
  if (errors > 0) {
    console.log(`\n❌ Database consistency check failed: ${errors} error(s)`);
    process.exit(1);
  }
  
  console.log("\n✅ Database consistency check passed!");
  console.log("   ✓ Single product with correct slug");
  console.log("   ✓ Name matches expected value");
  console.log("   ✓ SKU matches expected value");
  console.log("   ✓ Price matches expected value");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("❌ Error:", e);
    prisma.$disconnect();
    process.exit(1);
  });
EOF

# Run verification
echo "🔄 Running database consistency check..."
npx tsx verify-db-consistency.ts

# Cleanup
rm -f verify-db-consistency.ts

echo ""
echo "✅ Database consistency verification complete!"

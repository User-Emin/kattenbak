#!/bin/bash

# ✅ PRODUCT DATA RESTORATION SCRIPT
# Herstelt productdata naar de correcte waarden als deze is gereset
# Wordt automatisch uitgevoerd als verificatie faalt

set -e

echo "🔧 PRODUCT DATA RESTORATION - $(date)"
echo "=================================="

# Check if we're on the server
if [ ! -d "/var/www/kattenbak/backend" ]; then
  echo "❌ This script must be run on the production server"
  exit 1
fi

cd /var/www/kattenbak/backend

# Create restoration script
cat > restore-product-data.ts << 'EOF'
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const productSlug = "automatische-kattenbak-premium";
  
  console.log("🔄 Restoring product data...");
  
  // Get or create category
  let category = await prisma.category.findUnique({
    where: { slug: "kattenbakken" }
  });
  
  if (!category) {
    category = await prisma.category.create({
      data: {
        name: "Kattenbakken",
        slug: "kattenbakken",
        description: "Slimme en automatische kattenbakken voor moderne kattenliefhebbers",
        isActive: true,
        sortOrder: 1
      }
    });
    console.log("✅ Category created");
  }
  
  // Get or update product
  let product = await prisma.product.findUnique({
    where: { slug: productSlug }
  });
  
  const productData = {
    name: "ALP1071 Kattenbak",
    sku: "ALP1071",
    price: 219.95,
    description: "De beste automatische kattenbak met zelfreinigende functie. Perfect voor katten tot 7kg. Volledig automatisch met app-bediening.",
    shortDescription: "Zelfreinigende kattenbak met app-bediening en gezondheidsmonitoring.",
    images: [
      "/uploads/products/27cb78df-2f8e-4f42-8c27-886fdc2dfda8.jpg",
      "/uploads/products/2b8b63bf-d43c-4e8c-89d2-9670967f1989.jpg",
      "/uploads/products/41d856c0-3042-46bd-b300-f2f3c8f8704d.jpg",
      "/uploads/products/db4ff383-1271-498e-a162-795f3ec56817.jpg",
      "/uploads/products/cb9c5b7a-17eb-4068-b0c6-7d7d056dbba0.jpg"
    ] as any,
    metaTitle: "ALP1071 Kattenbak - Zelfreinigende Kattenbak | Catsupply",
    metaDescription: "De beste automatische kattenbak met zelfreinigende functie. Perfect voor katten tot 7kg. Volledig automatisch met app-bediening.",
    isActive: true,
    isFeatured: true,
    categoryId: category.id,
    publishedAt: new Date()
  };
  
  if (product) {
    product = await prisma.product.update({
      where: { slug: productSlug },
      data: productData
    });
    console.log(`✅ Product updated: ${product.name} - €${product.price}`);
  } else {
    product = await prisma.product.create({
      data: {
        ...productData,
        slug: productSlug,
        compareAtPrice: 399.99,
        stock: 15,
        lowStockThreshold: 5,
        trackInventory: true,
        weight: 5.2,
        dimensions: {
          length: 55,
          width: 45,
          height: 35
        } as any
      }
    });
    console.log(`✅ Product created: ${product.name} - €${product.price}`);
  }
  
  // Delete old variants
  await prisma.productVariant.deleteMany({
    where: { productId: product.id }
  });
  console.log("✅ Old variants deleted");
  
  // Create correct variants
  const variants = [
    {
      name: "Premium Beige",
      colorCode: "BEIGE",
      sku: "ALP1071-BEIGE",
      priceAdjustment: 0,
      stock: 15,
      sortOrder: 1,
      isActive: true
    },
    {
      name: "Premium Grijs",
      colorCode: "GRIJS",
      sku: "ALP1071-GRIJS",
      priceAdjustment: 0,
      stock: 15,
      sortOrder: 2,
      isActive: true
    }
  ];
  
  for (const variant of variants) {
    await prisma.productVariant.create({
      data: {
        ...variant,
        productId: product.id,
        images: []
      }
    });
    console.log(`✅ Variant created: ${variant.name} (${variant.colorCode})`);
  }
  
  console.log("✅ Product data restoration complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("❌ Error:", e);
    prisma.$disconnect();
    process.exit(1);
  });
EOF

# Run restoration
echo "🔄 Running restoration script..."
npx tsx restore-product-data.ts

# Cleanup
rm -f restore-product-data.ts

echo ""
echo "✅ Product data restoration complete!"
echo "   Run scripts/verify-product-data.sh to verify"

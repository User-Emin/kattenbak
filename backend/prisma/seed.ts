import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  
  // 1. Create Category
  console.log('1️⃣ Creating category...');
  const category = await prisma.category.create({
    data: {
      name: 'Kattenbakken',
      slug: 'kattenbakken',
      description: 'Slimme en automatische kattenbakken voor moderne kattenliefhebbers',
      isActive: true,
      sortOrder: 1
    }
  });
  console.log(`✅ Category created: ${category.name}`);
  
  // 2. Create Main Product
  console.log('\n2️⃣ Creating product...');
  const product = await prisma.product.create({
    data: {
      sku: 'KB-AUTO-001',
      name: 'Automatische Kattenbak Premium',
      slug: 'automatische-kattenbak-premium',
      description: `Premium zelfreinigende kattenbak met app-bediening. 
      
Kenmerken:
• Automatische reiniging na elk gebruik
• Fluisterstille werking (32dB)
• Meervoudige veiligheidssensoren
• UV-sterilisatie voor geurcontrole
• Real-time gezondheidsmonitoring via app
• Geschikt voor katten tot 7kg
• Grote capaciteit (10L afvalbak)
• Compatibel met alle strooiselsoorten`,
      shortDescription: 'Zelfreinigende kattenbak met app-bediening en gezondheidsmonitoring',
      price: 299.99,
      compareAtPrice: 399.99,
      stock: 15,
      lowStockThreshold: 5,
      trackInventory: true,
      weight: 5.2,
      dimensions: {
        length: 55,
        width: 45,
        height: 35
      },
      images: [
        '/images/product-main.jpg',
        '/images/product-detail-1.jpg',
        '/images/product-detail-2.jpg'
      ],
      metaTitle: 'Automatische Kattenbak Premium - Zelfreinigende Kattenbak | Catsupply',
      metaDescription: 'Premium zelfreinigende kattenbak met app-bediening en gezondheidsmonitoring. Automatische reiniging, fluisterstil, en veilig voor katten tot 7kg.',
      isActive: true,
      isFeatured: true,
      categoryId: category.id,
      publishedAt: new Date()
    }
  });
  console.log(`✅ Product created: ${product.name} (€${product.price})`);
  
  // 3. Create Product Variants
  console.log('\n3️⃣ Creating product variants...');
  
  const variants = [
    {
      name: 'Premium Wit',
      colorName: 'Wit',
      colorHex: '#FFFFFF',
      sku: 'KB-AUTO-001-WHT',
      stock: 8,
      priceAdjustment: 0
    },
    {
      name: 'Premium Grijs',
      colorName: 'Grijs',
      colorHex: '#808080',
      sku: 'KB-AUTO-001-GRY',
      stock: 7,
      priceAdjustment: 0
    }
  ];
  
  for (const variantData of variants) {
    const variant = await prisma.productVariant.create({
      data: {
        ...variantData,
        productId: product.id,
        images: [],
        isActive: true
      }
    });
    console.log(`  ✅ Variant: ${variant.name} (Stock: ${variant.stock})`);
  }
  
  console.log('\n✅ Database seeded successfully!');
  console.log(`\n📊 Summary:`);
  console.log(`   • Categories: 1`);
  console.log(`   • Products: 1`);
  console.log(`   • Variants: ${variants.length}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('\n❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

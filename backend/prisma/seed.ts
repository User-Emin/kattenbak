import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  
  // 1. Create or Get Category (zorg dat data niet verloren gaat)
  console.log('1️⃣ Creating/getting category...');
  let category = await prisma.category.findUnique({
    where: { slug: 'kattenbakken' }
  });
  
  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'Kattenbakken',
        slug: 'kattenbakken',
        description: 'Slimme en automatische kattenbakken voor moderne kattenliefhebbers',
        isActive: true,
        sortOrder: 1
      }
    });
    console.log(`✅ Category created: ${category.name}`);
  } else {
    console.log(`✅ Category already exists: ${category.name}`);
  }
  
  // 2. Create or Get Main Product (zorg dat data niet verloren gaat)
  // ✅ CRITICAL: NEVER overwrite existing product data - always preserve admin changes
  // ✅ STABILIZATION: This ensures product data (name, SKU, price, variants) remains stable
  //    across builds and deployments. Admin changes are NEVER overwritten.
  console.log('\n2️⃣ Checking for existing product...');
  let product = await prisma.product.findUnique({
    where: { slug: 'automatische-kattenbak-premium' }
  });
  
  if (product) {
    console.log(`✅ Product already exists: ${product.name} (€${product.price})`);
    console.log('✅ Skipping product creation to preserve existing admin data');
    console.log('✅ Dynamic data preserved - admin changes will NOT be overwritten');
    console.log('✅ STABILIZATION: Product data is protected from reset');
    return;
  }
  
  product = await prisma.product.create({
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
      } as any,
      images: [
        '/images/product-main.jpg',
        '/images/product-detail-1.jpg',
        '/images/product-detail-2.jpg'
      ] as any,
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
        images: [] as any,
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

/**
 * PRODUCTION SEED DATA
 * Seeds initial product and settings
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding production database...');

  // Seed category first
  const category = await prisma.category.upsert({
    where: { slug: 'kattenbakken' },
    update: {},
    create: {
      name: 'Kattenbakken',
      slug: 'kattenbakken',
      description: 'Automatische kattenbakken',
    },
  });

  // Seed product
  // ✅ CRITICAL: Only create if doesn't exist - NEVER update existing products
  // This ensures admin changes are NEVER overwritten
  let product = await prisma.product.findUnique({
    where: { slug: 'automatische-kattenbak-premium' }
  });
  
  if (product) {
    console.log(`✅ Product already exists: ${product.name} (€${product.price})`);
    console.log('✅ Skipping product seed to preserve admin data');
  } else {
    product = await prisma.product.create({
      sku: 'ALP1017',
      slug: 'automatische-kattenbak-premium',
      name: 'ALP1017 Kattenbak',
      description: 'Premium zelfreinigende kattenbak met app-bediening. 65L vulruimte, 10.5L afvalbak, dubbele IR- en gewichtssensoren, open-top design. 55×51×54 cm, 11 kg.',
      shortDescription: 'Premium zelfreinigende kattenbak met app-bediening',
      price: 299.99,
      compareAtPrice: 399.99,
      stock: 50,
      weight: 11,
      dimensions: {
        length: 55,
        width: 51,
        height: 54,
        unit: 'cm',
      },
      isActive: true,
      isFeatured: true,
      categoryId: category.id,
      images: ['/images/premium-main.jpg', '/images/premium-detail.jpg'],
    },
  });

  console.log(`✅ Product seeded: ${product.name}`);

  // Seed settings
  const settings = [
    { key: 'siteName', value: 'Catsupply' },
    { key: 'siteDescription', value: 'Premium automatische kattenbakken' },
    { key: 'heroTitle', value: 'De Slimste Kattenbak van Nederland' },
    { key: 'heroSubtitle', value: 'Volledig automatisch & zelfreinigend' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log(`✅ Settings seeded: ${settings.length} items`);
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

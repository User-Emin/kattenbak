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
  const product = await prisma.product.upsert({
    where: { slug: 'automatische-kattenbak-premium' },
    update: {},
    create: {
      sku: 'KB-AUTO-001',
      slug: 'automatische-kattenbak-premium',
      name: 'Automatische Kattenbak Premium',
      description: 'Volledig automatisch zelfreinigend systeem met dubbele beveiliging en 10.5L XL afvalbak capaciteit.',
      shortDescription: 'Premium automatische kattenbak met zelfreinigend systeem',
      price: 299.99,
      compareAtPrice: 399.99,
      stock: 50,
      weight: 5.2,
      dimensions: {
        length: 50,
        width: 40,
        height: 35,
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

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories
  const category = await prisma.category.upsert({
    where: { slug: 'kattenbakken' },
    update: {},
    create: {
      name: 'Automatische Kattenbakken',
      slug: 'kattenbakken',
      description: 'Slimme zelfreinigende kattenbakken',
      isActive: true,
      sortOrder: 1,
    },
  });

  console.log('✓ Category created:', category.name);

  // Update existing products with categoryId
  const products = await prisma.product.findMany({
    where: { categoryId: null },
  });

  for (const product of products) {
    await prisma.product.update({
      where: { id: product.id },
      data: { categoryId: category.id },
    });
    console.log('✓ Updated product:', product.name);
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

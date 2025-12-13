/**
 * Seed script - Create admin user and sample data
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@localhost';
  
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
    },
  });

  console.log(`✅ Admin user created: ${admin.email}`);

  // Create sample category
  const category = await prisma.category.upsert({
    where: { slug: 'kattenbakken' },
    update: {},
    create: {
      name: 'Kattenbakken',
      slug: 'kattenbakken',
      description: 'Premium kattenbakken voor een schoon huis',
      isActive: true,
      sortOrder: 1,
    },
  });

  console.log(`✅ Category created: ${category.name}`);

  // Create sample product
  const product = await prisma.product.upsert({
    where: { slug: 'automatische-kattenbak-premium' },
    update: {},
    create: {
      sku: 'KB-AUTO-001',
      name: 'Automatische Kattenbak Premium',
      slug: 'automatische-kattenbak-premium',
      description: 'De beste automatische kattenbak met zelfreinigende functie. Geschikt voor katten tot 7kg. Stil, hygiënisch en gemakkelijk te onderhouden.',
      shortDescription: 'Zelfreinigende kattenbak met app-bediening',
      price: 299.99,
      compareAtPrice: 399.99,
      stock: 15,
      categoryId: category.id,
      images: [
        'https://placehold.co/800x800/f97316/white?text=Premium+Kattenbak',
      ],
      isActive: true,
      isFeatured: true,
      publishedAt: new Date(),
    },
  });

  console.log(`✅ Product created: ${product.name}`);

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SEED DATABASE - Create test categories for products
# Fix: Products need categoryId, maar er zijn geen categories!
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🌱 SEEDING DATABASE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd /Users/emin/kattenbak/backend

echo -e "${YELLOW}1. Running Prisma migrations...${NC}"
npx prisma migrate dev --name seed_categories 2>&1 | tail -5 || true

echo ""
echo -e "${YELLOW}2. Generating Prisma client...${NC}"
npx prisma generate 2>&1 | tail -3

echo ""
echo -e "${YELLOW}3. Creating seed script...${NC}"

cat > prisma/seed.ts << 'EOF'
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
EOF

echo ""
echo -e "${YELLOW}4. Running seed script...${NC}"
npx tsx prisma/seed.ts

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ DATABASE SEEDED!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"



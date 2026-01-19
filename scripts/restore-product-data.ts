import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Restoring product data...');
  
  const product = await prisma.product.update({
    where: { slug: 'automatische-kattenbak-premium' },
    data: {
      name: 'ALP1071 Kattenbak',
      sku: 'ALP1071',
      images: [
        '/uploads/products/27cb78df-2f8e-4f42-8c27-886fdc2dfda8.jpg',
        '/uploads/products/2b8b63bf-d43c-4e8c-89d2-9670967f1989.jpg',
        '/uploads/products/41d856c0-3042-46bd-b300-f2f3c8f8704d.jpg',
        '/uploads/products/db4ff383-1271-498e-a162-795f3ec56817.jpg',
        '/uploads/products/cb9c5b7a-17eb-4068-b0c6-7d7d056dbba0.jpg'
      ] as any
    }
  });
  
  console.log('✅ Product restored:');
  console.log(`   Name: ${product.name}`);
  console.log(`   SKU: ${product.sku}`);
  console.log(`   Images: ${(product.images as string[]).length}`);
  console.log(`   Price: €${product.price}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('❌ Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

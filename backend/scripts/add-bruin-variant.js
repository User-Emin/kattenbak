/**
 * ADD "BRUIN" COLOR VARIANT TO PRODUCT
 * Adds a brown (bruin) color option for the kattenbak
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addBruinVariant() {
  try {
    console.log('🎨 Adding "Bruin" color variant to product...\n');

    // Get the product
    const product = await prisma.product.findFirst({
      where: { slug: 'automatische-kattenbak-premium' },
      select: { id: true, name: true, slug: true, price: true }
    });

    if (!product) {
      console.log('❌ Product not found!');
      process.exit(1);
    }

    console.log(`Product found:`);
    console.log(`  Name: ${product.name}`);
    console.log(`  Slug: ${product.slug}`);
    console.log(`  Base Price: €${product.price}\n`);

    // Check if "Bruin" variant already exists
    const existingVariant = await prisma.productVariant.findFirst({
      where: {
        productId: product.id,
        colorName: 'Bruin'
      }
    });

    if (existingVariant) {
      console.log('✅ "Bruin" variant already exists!');
      console.log(`  Variant ID: ${existingVariant.id}`);
      console.log(`  Name: ${existingVariant.name}`);
      console.log(`  Color: ${existingVariant.colorName} (${existingVariant.colorHex})`);
      console.log(`  Stock: ${existingVariant.stock}`);
      process.exit(0);
    }

    // Create "Bruin" variant
    const bruinVariant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        name: 'Premium Bruin',
        colorName: 'Bruin',
        colorHex: '#8B4513', // Saddle Brown
        sku: 'KB-AUTO-BRUIN',
        stock: 50,
        priceAdjustment: 0, // Same price as base product
        images: [], // Will use product's default images
        isActive: true
      }
    });

    console.log('✅ "Bruin" variant created successfully!');
    console.log(`  Variant ID: ${bruinVariant.id}`);
    console.log(`  Name: ${bruinVariant.name}`);
    console.log(`  Color: ${bruinVariant.colorName} (${bruinVariant.colorHex})`);
    console.log(`  SKU: ${bruinVariant.sku}`);
    console.log(`  Stock: ${bruinVariant.stock}`);
    console.log(`  Price Adjustment: €${bruinVariant.priceAdjustment}`);
    console.log(`  Active: ${bruinVariant.isActive}`);

    await prisma.$disconnect();
    console.log('\n🎉 Bruin variant is now available in webshop!');
  } catch (error) {
    console.error('🚨 Error adding Bruin variant:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

addBruinVariant();


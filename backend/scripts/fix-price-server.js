/**
 * Fix product price on PRODUCTION SERVER
 * Run on server: node scripts/fix-price-server.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixProductPrice() {
  try {
    console.log('🔍 Checking product price on server...\n');
    
    const product = await prisma.product.findFirst({
      where: { slug: 'automatische-kattenbak-premium' },
      select: { id: true, name: true, price: true, slug: true }
    });

    if (!product) {
      console.log('❌ Product not found!');
      process.exit(1);
    }

    console.log('Current product:');
    console.log(`  Name: ${product.name}`);
    console.log(`  Slug: ${product.slug}`);
    console.log(`  Price: €${product.price}\n`);

    const currentPrice = parseFloat(product.price.toString());

    if (currentPrice !== 1.00) {
      console.log(`❌ WRONG PRICE: €${currentPrice}`);
      console.log('🔧 Fixing to €1.00...\n');

      await prisma.product.update({
        where: { id: product.id },
        data: { price: 1.00 }
      });

      console.log('✅ Price successfully updated to €1.00!');
      
      // Verify
      const updated = await prisma.product.findUnique({
        where: { id: product.id },
        select: { price: true }
      });
      console.log(`✓  Verified: €${updated.price}\n`);
    } else {
      console.log('✅ Price is already correct (€1.00)\n');
    }

    console.log('═══════════════════════════════════════');
    console.log('  ✅ PRICE FIX COMPLETE');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error fixing price:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductPrice();


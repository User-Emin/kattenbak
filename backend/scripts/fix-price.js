// Script om product prijs te fixen van €100.01 naar €1.00 (100 cents)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixPrice() {
  try {
    // Check current price
    const product = await prisma.product.findUnique({
      where: { slug: 'automatische-kattenbak-premium' },
      select: { name: true, sku: true, price: true }
    });
    
    console.log('=== HUIDIGE PRIJS ===');
    console.log(`Product: ${product?.name}`);
    console.log(`SKU: ${product?.sku}`);
    console.log(`Prijs: €${product?.price}`);
    
    // Update to 100 cents (€1.00)
    const updated = await prisma.product.update({
      where: { slug: 'automatische-kattenbak-premium' },
      data: { price: 100 }
    });
    
    console.log('\n=== NIEUWE PRIJS ===');
    console.log(`Prijs: €${updated.price}`);
    console.log('\n✅ Prijs succesvol geupdate naar 100 cents (€1.00)!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPrice();


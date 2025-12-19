/**
 * GET/POST /api/products
 * List products & Create new product
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, isAdmin } from '@/lib/auth';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

// GET /api/products - List all products
export async function GET(request: NextRequest) {
  const ip = getClientIP(request.headers);
  const rateLimit = checkRateLimit(ip, 'products-list');
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  
  const user = getUserFromRequest(request.headers);
  
  if (!user || !isAdmin(user)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Products list error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  const ip = getClientIP(request.headers);
  const rateLimit = checkRateLimit(ip, 'products-create');
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  
  const user = getUserFromRequest(request.headers);
  
  if (!user || !isAdmin(user)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const data = await request.json();
    
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
        description: data.description,
        shortDescription: data.shortDescription,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        sku: data.sku,
        stock: data.stock || 0,
        lowStockThreshold: data.lowStockThreshold || 10,
        trackInventory: data.trackInventory ?? true,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        categoryId: data.categoryId || null,
        images: data.images || [],
      },
      include: {
        category: true,
        variants: true,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Product create error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}



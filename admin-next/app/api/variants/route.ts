/**
 * VARIANTS API ROUTE
 * Endpoint: /admin/api/variants
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET - Fetch variants (optionally filtered by productId)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    const where = productId ? { productId } : {};

    const variants = await prisma.productVariant.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: variants,
    });
  } catch (error: any) {
    console.error('Error fetching variants:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch variants' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new variant
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, name, sku, stock, colorCode } = body;

    if (!productId || !name) {
      return NextResponse.json(
        { success: false, error: 'ProductId and name are required' },
        { status: 400 }
      );
    }

    const variant = await prisma.productVariant.create({
      data: {
        productId,
        name,
        sku,
        stock: stock || 0,
        colorCode,
      },
    });

    return NextResponse.json({
      success: true,
      data: variant,
    });
  } catch (error: any) {
    console.error('Error creating variant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create variant' },
      { status: 500 }
    );
  }
}

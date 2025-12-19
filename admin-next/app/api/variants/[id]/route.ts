/**
 * VARIANT DETAIL API ROUTE
 * Endpoint: /admin/api/variants/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET - Fetch a single variant by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const variant = await prisma.productVariant.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    });

    if (!variant) {
      return NextResponse.json(
        { success: false, error: 'Variant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: variant,
    });
  } catch (error: any) {
    console.error('Error fetching variant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch variant' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update a variant by ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, sku, stock, colorCode, isActive } = body;

    const variant = await prisma.productVariant.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(sku !== undefined && { sku }),
        ...(stock !== undefined && { stock }),
        ...(colorCode !== undefined && { colorCode }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({
      success: true,
      data: variant,
    });
  } catch (error: any) {
    console.error('Error updating variant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update variant' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a variant by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.productVariant.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Variant deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting variant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete variant' },
      { status: 500 }
    );
  }
}

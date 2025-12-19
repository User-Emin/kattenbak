/**
 * GET/PUT /api/orders/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(request.headers);
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = await params;
  
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        shippingAddress: true,
        payment: true,
      },
    });
    
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Order get error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(request.headers);
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = await params;
  
  try {
    const data = await request.json();
    
    const order = await prisma.order.update({
      where: { id },
      data: {
        status: data.status,
        ...(data.status === 'DELIVERED' && { completedAt: new Date() }),
      },
      include: {
        items: { include: { product: true } },
        shippingAddress: true,
        payment: true,
      },
    });
    
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
  }
}



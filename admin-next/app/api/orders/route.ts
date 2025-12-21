/**
 * GET /api/orders - List orders
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request.headers);
  
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('Orders list error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}







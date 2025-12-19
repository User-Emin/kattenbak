/**
 * GET/PUT /api/returns/[id] ⭐ NEW!
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
    const returnItem = await prisma.return.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: { include: { product: true } },
          },
        },
      },
    });
    
    if (!returnItem) {
      return NextResponse.json({ success: false, error: 'Return not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: returnItem });
  } catch (error) {
    console.error('Return get error:', error);
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
    
    const returnItem = await prisma.return.update({
      where: { id },
      data: {
        status: data.status,
        adminNotes: data.adminNotes,
        ...(data.status === 'APPROVED' && { approvedAt: new Date() }),
        ...(data.status === 'REFUNDED' && { refundedAt: new Date() }),
      },
      include: {
        order: {
          include: {
            items: { include: { product: true } },
          },
        },
      },
    });
    
    return NextResponse.json({ success: true, data: returnItem });
  } catch (error) {
    console.error('Return update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update return' }, { status: 500 });
  }
}



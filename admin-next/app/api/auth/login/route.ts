/**
 * POST /api/auth/login
 * Admin login with rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken, verifyPassword } from '@/lib/auth';
import { checkRateLimit, getClientIP, LOGIN_RATE_LIMIT } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = getClientIP(request.headers);
  
  // Rate limiting - 5 login attempts per 15min
  const rateLimit = checkRateLimit(ip, 'login', LOGIN_RATE_LIMIT);
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: 'Too many login attempts. Please try again later.',
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(LOGIN_RATE_LIMIT.max),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(rateLimit.resetAt),
        },
      }
    );
  }
  
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email and password are required',
        },
        { status: 400 }
      );
    }
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials',
        },
        { status: 401 }
      );
    }
    
    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    
    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials',
        },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied. Admin only.',
        },
        { status: 403 }
      );
    }
    
    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    
    // Return success with token and user data (no password)
    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}



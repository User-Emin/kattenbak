import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * SECURE MIDDLEWARE - Auth protection
 */
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Public paths (no auth required) - with /admin prefix
  const publicPaths = ['/admin/login', '/login'];
  const isPublicPath = publicPaths.some(p => path.startsWith(p));
  
  // Get token from cookies or headers
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  // Redirect to login if not authenticated (admin routes only)
  if (!isPublicPath && !token && path.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  // Redirect to dashboard if already logged in and accessing login
  if (isPublicPath && token && (path === '/admin/login' || path === '/login')) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

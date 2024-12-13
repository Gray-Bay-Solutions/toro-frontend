// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin-token')?.value;
    console.log('Token from cookie:', token);

    if (!token) {
      console.log('No token found');
      return NextResponse.redirect(new URL('/', request.url));
    }

    const verified = verifyToken(token);
    console.log('Verification result:', verified);

    if (!verified) {
      console.log('Token verification failed');
      return NextResponse.redirect(new URL('/', request.url));
    }

    console.log('Token verified successfully');
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
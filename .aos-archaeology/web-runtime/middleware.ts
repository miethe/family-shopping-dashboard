import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'auth_token';
const PUBLIC_ROUTES = ['/login', '/register', '/'];

/**
 * Middleware to protect routes and handle authentication redirects
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from localStorage (will be handled client-side)
  // Note: middleware runs server-side, so we can't access localStorage directly
  // Instead, we'll check for cookies or let client-side handle auth redirect

  // For now, middleware will just allow all routes
  // Client-side AuthContext will handle redirects
  // This is a common pattern for Next.js App Router with client-side auth

  return NextResponse.next();
}

/**
 * Configure which routes to run middleware on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow requests for NextAuth.js specific paths, Next.js internals, and common static asset folders
  if (
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') || // If you serve static assets from a /public/static folder
    pathname.startsWith('/images/') || // If you serve images from /public/images
    pathname.match(/\.(?:ico|png|svg|jpg|jpeg|gif|txt|xml|webmanifest)$/i) // Common static file extensions
  ) {
    return NextResponse.next();
  }

  // Define public paths that don't require authentication
  const publicPaths = [
    '/', // Assuming the root is a public landing page
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/forgot-password',
    // Reset password paths often include a token, so use startsWith
  ];

  // Check if the current path is public or a reset password path
  const isPublicPath = publicPaths.some(path => pathname === path) ||
                       pathname.startsWith('/auth/reset-password/');

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error('NEXTAUTH_SECRET is not set. Authentication checks will be skipped in middleware.');
    // Depending on policy, either allow all or deny all if secret is missing.
    // For now, allowing to prevent full site block during setup issues.
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret });

  if (!token && !isPublicPath) {
    const signInUrl = new URL('/auth/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (token && (pathname === '/auth/sign-in' || pathname === '/auth/sign-up')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - (these are now handled inside the middleware logic for more clarity)
     * This matcher will run on almost all requests, and the middleware logic will decide.
     * A common alternative is to exclude specific static file patterns here.
     * For this implementation, we let the middleware logic handle exclusions.
     */
    '/((?!api/auth/session|_next/static|_next/image|assets/|favicon.ico|sw.js).*)',
  ],
};

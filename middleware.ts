// middleware.ts
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { locales, Locale } from './lib/i18n'; // Ensure correct path to i18n config

const publicPages = [
  '/', // Assuming the root is a public landing page
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/forgot-password',
  // Add any other public pages, e.g., '/about', '/contact'
  // Reset password paths often include a token, so use a regex or startsWith
];

const intlMiddleware = createMiddleware({
  locales: locales as unknown as string[], // Cast needed due to `as const` in i18n.ts
  defaultLocale: 'en',
  localePrefix: 'always', // Or 'as-needed' or 'never'
});

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply i18n routing first
  const i18nResponse = intlMiddleware(request);
  if (i18nResponse.headers.has('Location')) { // Check if next-intl middleware wants to redirect
      return i18nResponse;
  }

  // Extract locale from pathname (e.g., /en/dashboard -> en)
  const pathnameLocale = locales.find(loc => pathname.startsWith(`/${loc}/`));
  const basePath = pathnameLocale ? pathname.substring(pathnameLocale.length + 1) : pathname;

  // Check if the path (without locale prefix) is public or a reset password path
  // Ensure basePath starts with / for comparison or is empty for root
  const effectivePath = basePath.startsWith('/') ? basePath : `/${basePath}`;

  const isPublicPath = publicPages.some(path => effectivePath === path) ||
                       effectivePath.startsWith('/auth/reset-password/');

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error('NEXTAUTH_SECRET is not set. Authentication checks will be skipped in middleware.');
    return i18nResponse; // Return the response from intlMiddleware
  }

  const token = await getToken({ req: request, secret });

  if (!token && !isPublicPath) {
    // For unauthenticated users trying to access protected pages,
    // redirect to the sign-in page *with the current locale*.
    const signInUrl = new URL(`/${pathnameLocale || 'en'}/auth/sign-in`, request.url);
    // Append the original path (without locale) as callbackUrl
    signInUrl.searchParams.set('callbackUrl', effectivePath); // Use effectivePath for callback
    return NextResponse.redirect(signInUrl);
  }

  if (token && (effectivePath === '/auth/sign-in' || effectivePath === '/auth/sign-up')) {
    // For authenticated users trying to access sign-in/sign-up,
    // redirect to the dashboard *with the current locale*.
    return NextResponse.redirect(new URL(`/${pathnameLocale || 'en'}/dashboard`, request.url));
  }

  return i18nResponse; // If no auth redirect, proceed with the i18n response
}

export const config = {
  // Matcher to apply middleware to all paths except for static files and specific API routes
  matcher: [
    '/((?!api/auth/session|_next/static|_next/image|images|static|assets/|favicon.ico|sw.js|robots.txt|sitemap.xml|manifest.json|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

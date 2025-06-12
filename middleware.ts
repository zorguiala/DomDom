// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const publicPages = [
  "/", // Assuming the root is a public landing page
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/forgot-password",
  // Add any other public pages, e.g., '/about', '/contact'
  // Reset password paths often include a token, so use a regex or startsWith
];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is public or a reset password path
  const effectivePath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  const isPublicPath =
    publicPages.some((path) => effectivePath === path) ||
    effectivePath.startsWith("/auth/reset-password/");

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error(
      "NEXTAUTH_SECRET is not set. Authentication checks will be skipped in middleware.",
    );
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret });

  if (!token && !isPublicPath) {
    // For unauthenticated users trying to access protected pages,
    // redirect to the sign-in page.
    const signInUrl = new URL(`/auth/sign-in`, request.url);
    signInUrl.searchParams.set("callbackUrl", effectivePath);
    return NextResponse.redirect(signInUrl);
  }

  if (
    token &&
    (effectivePath === "/auth/sign-in" || effectivePath === "/auth/sign-up")
  ) {
    // For authenticated users trying to access sign-in/sign-up,
    // redirect to the dashboard.
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Matcher to apply middleware to all paths except for static files and all API auth routes
  matcher: [
    "/((?!api/auth|_next/static|_next/image|images|static|assets/|favicon.ico|sw.js|robots.txt|sitemap.xml|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

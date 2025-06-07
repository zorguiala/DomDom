import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Remove locale-based routing - language switching is now client-side
  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except static assets and API routes
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

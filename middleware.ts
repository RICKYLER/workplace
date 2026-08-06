import { NextRequest, NextResponse } from "next/server";

/**
 * Global middleware — runs on every /api/* request.
 * Adds security headers and basic CORS protection.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Prevent MIME sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  // Block clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  // XSS protection (legacy browsers)
  response.headers.set("X-XSS-Protection", "1; mode=block");
  // Referrer policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // Remove server fingerprint
  response.headers.set("X-Powered-By", "");

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};

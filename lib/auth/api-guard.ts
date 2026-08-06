import { NextRequest, NextResponse } from "next/server";

/**
 * Protects admin-only API routes with a bearer token.
 *
 * Usage inside a route handler:
 *   const authError = requireAdminAuth(request);
 *   if (authError) return authError;
 *
 * The client must send:
 *   Authorization: Bearer <ADMIN_API_SECRET>
 *
 * Set ADMIN_API_SECRET in your .env.local and Vercel environment variables.
 */
export function requireAdminAuth(request: NextRequest | Request): NextResponse | null {
  const secret = process.env.ADMIN_API_SECRET;

  if (!secret) {
    console.error("[api-guard] ADMIN_API_SECRET is not set. Denying all admin requests.");
    return NextResponse.json(
      { error: "Server misconfiguration: admin secret not configured." },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("Authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token || token !== secret) {
    return NextResponse.json(
      { error: "Unauthorized. Valid admin token required." },
      { status: 401 }
    );
  }

  return null; // Auth passed
}

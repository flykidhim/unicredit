// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// 🔓 No auth logic here. All security checks happen in server layouts.
// This avoids Edge/NextAuth token decoding issues that were causing
// /app → /login bouncing in production.

export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

// You can even remove this config if you want it global; but since we
// don't do anything here, it doesn't really matter. Keeping explicit.
export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};

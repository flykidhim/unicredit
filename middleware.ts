// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as any;

    // If not verified yet, and trying to hit protected area → go to /otp
    if (token && token.otpVerified === false) {
      // Avoid loop just in case we ever add /otp to matcher
      if (!req.nextUrl.pathname.startsWith("/otp")) {
        const url = new URL("/otp", req.url);
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Require a valid token for these routes
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Only protect authenticated app/admin area
export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};

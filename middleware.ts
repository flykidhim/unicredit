// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const authSecret = process.env.NEXTAUTH_SECRET;

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as any;

    // If logged in but OTP not yet verified → force /otp
    if (token && token.otpVerified === false) {
      if (!req.nextUrl.pathname.startsWith("/otp")) {
        const url = new URL("/otp", req.url);
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Require a valid token on /app and /admin
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
    secret: authSecret, // ✅ Edge runtime now shares the same secret
  }
);

// Only protect authenticated app/admin area
export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};

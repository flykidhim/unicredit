// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const authSecret = process.env.NEXTAUTH_SECRET;

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as any;

    // If user is logged in but OTP not verified yet, force them to /otp
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
      // Only allow access if a token exists. If not,
      // next-auth will redirect to pages.signIn ("/login")
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
    // ✅ Must match lib/auth.ts & Vercel env
    secret: authSecret,
  }
);

// Only protect /app and /admin paths
export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};

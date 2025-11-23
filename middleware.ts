// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // Just require a valid token for /app and /admin
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};

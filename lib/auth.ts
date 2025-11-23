// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  // 🔐 Make sure this env var is set on Vercel + .env.local
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    CredentialsProvider({
      name: "Credenziali",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        // Only ACTIVE users can log in
        if (user.status !== "ACTIVE") return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) return null;

        // Return only what we need
        return {
          id: String(user.id),
          email: user.email,
          name: user.fullName,
          role: user.role,
          fullName: user.fullName,
          profileImageUrl: user.profileImageUrl,
          dateOfBirth: user.dateOfBirth,
          createdAt: user.createdAt, // used as "customerSince"
        } as any;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On login
      if (user) {
        const u = user as any;

        token.id = u.id;
        token.role = u.role;
        token.fullName = u.fullName ?? u.name ?? "";
        token.email = u.email;
        token.profileImageUrl = u.profileImageUrl ?? null;
        token.dateOfBirth = u.dateOfBirth ?? null;

        // Use createdAt as "customer since"
        token.customerSince = u.createdAt ?? null;

        // Force a fresh OTP verification on each sign-in
        token.otpVerified = false;
      }

      // When you call useSession().update(...) (OTP page, profile, etc.)
      if (trigger === "update" && session) {
        const s = session as any;

        if (typeof s.otpVerified === "boolean") {
          token.otpVerified = s.otpVerified;
        }

        if (typeof s.profileImageUrl === "string") {
          token.profileImageUrl = s.profileImageUrl;
        }

        if (typeof s.fullName === "string") {
          token.fullName = s.fullName;
        }

        if (s.dateOfBirth) {
          token.dateOfBirth = s.dateOfBirth;
        }

        if (s.customerSince) {
          token.customerSince = s.customerSince;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id;
        session.user.name =
          (token.fullName as string | undefined) ?? session.user.name ?? "";
        session.user.email =
          (token.email as string | undefined) ?? session.user.email ?? "";

        (session.user as any).role =
          (token.role as string | undefined) ?? "USER";
        (session.user as any).profileImageUrl =
          (token.profileImageUrl as string | null | undefined) ?? null;
        (session.user as any).dateOfBirth =
          (token.dateOfBirth as string | Date | null | undefined) ?? null;

        // Expose "customer since"
        (session.user as any).customerSince =
          (token.customerSince as string | Date | null | undefined) ?? null;

        // OTP flag – default false if missing
        (session.user as any).otpVerified =
          typeof token.otpVerified === "boolean" ? token.otpVerified : false;
      }

      return session;
    },
  },
};

// (Not used as a route in App Router, but harmless)
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

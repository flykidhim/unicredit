// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient, Role, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  // ✅ Make sure this matches NEXTAUTH_SECRET in Vercel & .env.local
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
        if (user.status !== UserStatus.ACTIVE) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) return null;

        // Only return what you need on the token
        return {
          id: String(user.id),
          email: user.email,
          name: user.fullName,
          role: user.role as Role,
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
      // Initial sign-in
      if (user) {
        const u = user as any;

        token.id = u.id;
        token.email = u.email;
        token.role = u.role;
        token.fullName = u.fullName ?? u.name ?? "";
        token.profileImageUrl = u.profileImageUrl ?? null;
        token.dateOfBirth = u.dateOfBirth ?? null;

        // use createdAt as "customer since"
        token.customerSince = u.createdAt ?? null;

        // ✅ On every fresh login, force OTP again
        token.otpVerified = false;
      }

      // When you call useSession().update(...)
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
        // Basic user identity
        (session.user as any).id = token.id;
        session.user.email =
          (token.email as string | undefined) ?? session.user.email ?? "";
        session.user.name =
          (token.fullName as string | undefined) ?? session.user.name ?? "";

        // Extra fields
        (session.user as any).role =
          (token.role as string | undefined) ?? "USER";
        (session.user as any).profileImageUrl =
          (token.profileImageUrl as string | null | undefined) ?? null;
        (session.user as any).dateOfBirth =
          (token.dateOfBirth as string | Date | null | undefined) ?? null;
        (session.user as any).customerSince =
          (token.customerSince as string | Date | null | undefined) ?? null;

        // OTP flag
        (session.user as any).otpVerified =
          typeof token.otpVerified === "boolean" ? token.otpVerified : false;
      }

      return session;
    },
  },
};

// /api/auth/[...nextauth]/route.ts
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

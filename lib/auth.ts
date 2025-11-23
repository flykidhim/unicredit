// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
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
        if (user.status !== "ACTIVE") return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) return null;

        // Return only what we need; we'll read more from Prisma via `user` here
        return {
          id: String(user.id),
          email: user.email,
          name: user.fullName,
          role: user.role,
          fullName: user.fullName,
          profileImageUrl: user.profileImageUrl,
          dateOfBirth: user.dateOfBirth,
          createdAt: user.createdAt,
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

        // ✅ Use `createdAt` as "customer since" instead of a non-existent `customerSince` field
        token.customerSince = u.createdAt ?? null;

        // When user signs in, force a fresh OTP verification
        token.otpVerified = false;
      }

      // On `useSession().update(...)` from the OTP page or profile page
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

        // Expose "customer since" based on token (which we filled from createdAt)
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

// Needed for the /api/auth/[...nextauth]/route.ts
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

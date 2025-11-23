// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credenziali",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "nome.cognome@example.com",
        },
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

        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!valid) return null;

        // This object is what will be available as `user` in the jwt callback
        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          fullName: user.fullName,
          role: user.role,
          status: user.status,
          profileImageUrl: (user as any).profileImageUrl ?? null,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // First time JWT is created – on sign in
      if (user) {
        token.userId = (user as any).id;
        token.role = (user as any).role;
        token.fullName = (user as any).fullName || user.name;
        token.profileImageUrl = (user as any).profileImageUrl ?? null;

        // Every fresh login must pass OTP again
        token.otpVerified = false;
      }

      // Allow client to update token fields via `session.update()`
      if (trigger === "update" && session) {
        if (Object.prototype.hasOwnProperty.call(session, "otpVerified")) {
          (token as any).otpVerified = (session as any).otpVerified;
        }
        if (Object.prototype.hasOwnProperty.call(session, "profileImageUrl")) {
          (token as any).profileImageUrl = (session as any).profileImageUrl;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).userId;
        (session.user as any).role = (token as any).role;
        (session.user as any).fullName = (token as any).fullName;
        (session.user as any).profileImageUrl =
          (token as any).profileImageUrl ?? null;
        (session.user as any).otpVerified = (token as any).otpVerified ?? false;
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

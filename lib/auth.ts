// lib/auth.ts
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient, UserStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!isValid) return null;

        if (user.status !== UserStatus.ACTIVE) {
          return null;
        }

        // This object becomes the base of the JWT
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.fullName,
          fullName: user.fullName,
          role: user.role,
          otpVerified: false, // ALWAYS false on fresh login
          profileImageUrl: (user as any).profileImageUrl ?? null,
          dateOfBirth: (user as any).dateOfBirth ?? null,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // First login
      if (user) {
        token.id = (user as any).id;
        token.email = user.email;
        token.name = (user as any).fullName || user.name;
        token.role = (user as any).role || Role.USER;
        (token as any).otpVerified = (user as any).otpVerified ?? false;
        (token as any).profileImageUrl = (user as any).profileImageUrl ?? null;
        (token as any).dateOfBirth = (user as any).dateOfBirth ?? null;
      }

      // Called when you use session.update() on the client (OTP page)
      if (trigger === "update" && session) {
        // We only care about otpVerified (and maybe profile image)
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
        (session.user as any).id = token.id;
        session.user.email = (token.email as string) || session.user.email;
        session.user.name = (token.name as string) || session.user.name;
        (session.user as any).role = (token as any).role ?? Role.USER;
        (session.user as any).otpVerified = (token as any).otpVerified ?? false;
        (session.user as any).profileImageUrl =
          (token as any).profileImageUrl ?? null;
        (session.user as any).dateOfBirth = (token as any).dateOfBirth ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

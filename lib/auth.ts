// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email e password sono obbligatori.");
        }

        const email = credentials.email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          throw new Error("Credenziali non valide.");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          throw new Error("Credenziali non valide.");
        }

        // Strip sensitive fields and return minimal user object
        return {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          status: user.status,
          dateOfBirth: user.dateOfBirth,
          profileImageUrl: user.profileImageUrl,
        } as any;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // On sign in
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.name = (user as any).fullName ?? (user as any).name ?? token.name;
        token.status = (user as any).status;

        const dob = (user as any).dateOfBirth;
        token.dateOfBirth =
          dob instanceof Date ? dob.toISOString() : dob ?? null;
        token.profileImageUrl = (user as any).profileImageUrl ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).status = token.status;
        (session.user as any).dateOfBirth = token.dateOfBirth ?? null;
        (session.user as any).profileImageUrl = token.profileImageUrl ?? null;
        if (token.name) {
          session.user.name = token.name as string;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

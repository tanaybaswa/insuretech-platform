import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import type { MembershipRole } from "@prisma/client";
import type { JWT } from "next-auth/jwt";

export type AppUser = {
  id: string;
  email: string;
  name: string;
  role: MembershipRole;
  organizationId: string;
  organizationName: string;
};

declare module "next-auth" {
  interface User extends AppUser {}

  interface Session {
    user: AppUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends AppUser {}
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function toAppUser(token: JWT): AppUser {
  return {
    id: String(token.id),
    email: String(token.email ?? ""),
    name: String(token.name ?? ""),
    role: token.role as MembershipRole,
    organizationId: String(token.organizationId),
    organizationName: String(token.organizationName),
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
          include: {
            memberships: {
              include: { organization: true },
              take: 1,
            },
          },
        });

        if (!user || user.memberships.length === 0) {
          return null;
        }

        const valid = await compare(parsed.data.password, user.passwordHash);
        if (!valid) {
          return null;
        }

        const membership = user.memberships[0];

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: membership.role,
          organizationId: membership.organizationId,
          organizationName: membership.organization.name,
        } satisfies AppUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? "";
        token.email = user.email ?? "";
        token.name = user.name ?? "";
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.organizationName = user.organizationName;
      }
      return token;
    },
    async session({ session, token }) {
      const appUser = toAppUser(token);
      session.user = {
        ...session.user,
        ...appUser,
      };
      return session;
    },
  },
});

import { compareSync } from "bcrypt";
import { NextAuthOptions, User } from "next-auth";
import NextAuth from "next-auth/next";
import Credentials from "next-auth/providers/credentials";
import { env } from "process";
import { prisma } from "../../../server/db/client";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: env.SECRET ?? "secret",
  callbacks: {
    async jwt({ token, user }) {
      //Set token's user to the returned user on authorize
      if (user) {
        token.user = user as User;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        ...token.user,
      };
      return session;
    },
  },
  providers: [
    Credentials({
      name: "login",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Username" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credential) => {
        if (!credential) throw new Error("Invalid log in submission");
        const user = await prisma.user.findUnique({
          where: {
            username: credential.username,
          },
          select: {
            id: true,
            username: true,
            password: true,
            role: true,
            isActivated: true,
            profile: {
              select: {
                name: true,
              },
            },
          },
        });

        if (!user) throw new Error("User not found");
        if (!user.isActivated) throw new Error("User is not activated");
        if (!compareSync(credential.password, user.password))
          throw new Error("Incorrect password");

        const userReturn = { ...user, password: undefined };

        return userReturn as User;
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
};

export default NextAuth(authOptions);

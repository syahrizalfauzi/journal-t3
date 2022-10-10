import { NextAuthOptions, User } from "next-auth";
import NextAuth from "next-auth/next";
import Credentials from "next-auth/providers/credentials";
import { env } from "process";

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
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Username" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credential) => {
        if (!credential) throw new Error("Invalid log in submission");

        if (credential.password.length < 6)
          throw new Error("Anggap aja password salah");

        return {
          id: Date.now().toString(),
          role: 69,
          username: credential.username,
        } as User;
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
};

export default NextAuth(authOptions);

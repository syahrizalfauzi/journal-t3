// Must not be deleted so the custom interfaces works smh
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface User {
    id: string;
    username: string;
    role: number;
    profile: {
      name: string;
    };
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: User;
  }
}

declare module "next-auth/react" {
  interface SignInOptions {
    username: string;
    password: string;
  }
}

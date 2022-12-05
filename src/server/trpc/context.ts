// src/server/router/context.ts
import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "../../pages/api/auth/[...nextauth]";
import { prisma } from "../db/client";
// import { initializeApp, credential, app } from "firebase-admin";
// import { env } from "../../env/server.mjs";

/**
 * Replace this with an object if you want to pass things to createContextInner
 */
type CreateContextOptions = {
  session: Session | null;
  // firebaseApp: app.App;
};

/** Use this helper for:
 *  - testing, where we dont have to Mock Next.js' req/res
 *  - trpc's `createSSGHelpers` where we don't have req/res
 */
export const createContextInner = async (opts: CreateContextOptions) => {
  return {
    prisma,
    ...opts,
  };
};

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/
export const createContext = async ({
  req,
  res,
}: trpcNext.CreateNextContextOptions) => {
  const session = await unstable_getServerSession(req, res, authOptions);
  // const firebaseApp = initializeApp({
  //   credential: credential.cert({
  //     projectId: env.FIREBASE_PROJECT_ID,
  //     privateKey: env.FIREBASE_PRIVATE_KEY,
  //     clientEmail: env.FIREBASE_CLIENT_EMAIL,
  //   }),
  // });

  return await createContextInner({
    session,
    // firebaseApp,
  });
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;

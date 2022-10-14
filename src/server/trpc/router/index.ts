// src/server/router/index.ts
import { t } from "../trpc";

import { authRouter } from "./auth";
import { userRouter } from "./user";
import { questionRouter } from "./question";

export const appRouter = t.router({
  auth: authRouter,
  user: userRouter,
  question: questionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

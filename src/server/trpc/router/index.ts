// src/server/router/index.ts
import { t } from "../trpc";

import { authRouter } from "./auth";
import { userRouter } from "./user";
import { questionRouter } from "./question";
import { manuscriptRouter } from "./manuscript";
import { historyRouter } from "./history";
import { assesmentRouter } from "./assesment";

export const appRouter = t.router({
  auth: authRouter,
  user: userRouter,
  question: questionRouter,
  manuscript: manuscriptRouter,
  history: historyRouter,
  assesment: assesmentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

import { initTRPC } from "@trpc/server";
import type { Context } from "./context";
import superjson from "superjson";
import { ZodError } from "zod";
import zodErrorParser from "../utils/zodErrorParser";

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      message:
        error.code === "BAD_REQUEST" && error.cause instanceof ZodError
          ? zodErrorParser(error.cause)
          : null,
      data: {
        ...shape.data,
        // zodError:
        //   error.code === "BAD_REQUEST" && error.cause instanceof ZodError
        //     ? zodErrorParser(error.cause)
        //     : null,
      },
    };
  },
});

import { initTRPC } from "@trpc/server";
import type { Context } from "./context";
import superjson from "superjson";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === "BAD_REQUEST" && error.cause instanceof ZodError
            ? fromZodError(error.cause) //To be replaced
            : null,
      },
    };
  },
});

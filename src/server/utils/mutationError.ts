import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { TRPCError } from "@trpc/server";

const mutationError = (error: unknown, message?: string) => {
  const err = error as PrismaClientKnownRequestError;

  if (err.code === "P2025")
    return new TRPCError({
      code: "BAD_REQUEST",
      message: message ?? "Record not found",
    });
  // return res
  //   .status(404)
  //   .json({ ...errorMessageObject(message ?? "Record not found") });

  if (err.code === "P2002") {
    return new TRPCError({
      message: `${(err.meta?.target as string[])
        ?.map((t) => `${t.charAt(0).toUpperCase()}${t.slice(1)}`)
        .join(", ")} is already used`,
      code: "NOT_FOUND",
    });
  }

  return new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `${error}` });
};

//   return res.status(500).json({ error });

export default mutationError;

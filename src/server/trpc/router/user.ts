import { Prisma } from "@prisma/client";
import { userListQuery } from "../../queries/user";
import { paginationQuery, paginationMetadata } from "../../utils/pagination";
import { getOrderQuery } from "../../utils/sortOrder";
import { t } from "../trpc";
import { authGuard } from "../authguard";
import { TRPCError } from "@trpc/server";
import mutationError from "../../utils/mutationError";
import { z } from "zod";

const notFoundMessage = "User not found";

export const userRouter = t.router({
  list: t.procedure
    .use(authGuard(["admin"]))
    .input(userListQuery)
    .query(async ({ ctx, input }) => {
      const profileOrder = getOrderQuery({ ...input }, [
        "email",
        "name",
        "country",
      ]);

      const filter = {
        isActivated: { equals: input.filter?.isActivated },
      } as Prisma.UserWhereInput;

      const getCount = ctx.prisma.user.count({
        where: filter,
      });

      const getUsers = ctx.prisma.user.findMany({
        ...paginationQuery(input.page),
        where: filter,
        orderBy: profileOrder
          ? {
              profile: { ...profileOrder },
            }
          : getOrderQuery({ ...input }, [
              "username",
              "role",
              "isActivated",
              "createdAt",
            ]) ?? {
              createdAt: "desc",
            },
        select: {
          id: true,
          username: true,
          role: true,
          isActivated: true,
          createdAt: true,
          profile: { select: { email: true, name: true, country: true } },
        },
      });

      const [totalCount, users] = await ctx.prisma.$transaction([
        getCount,
        getUsers,
      ]);

      return {
        ...paginationMetadata(totalCount, input.page),
        users,
      };
    }),
  activate: t.procedure
    .use(authGuard(["admin"]))
    .input(
      z.object({
        id: z.string(),
        isActivated: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session?.user.id === input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can't modify activation on own account",
        });
      }

      try {
        const user = await ctx.prisma.user.update({
          where: {
            id: input.id,
          },
          data: {
            isActivated: input.isActivated,
          },
          select: {
            // id: true,
            username: true,
            // profile: {
            //     select: { email: true },
            // },
          },
        });

        return {
          message: `User '${user.username}' has been ${
            input.isActivated ? "activated" : "deactivated"
          }`,
        };
      } catch (e) {
        throw mutationError(e, notFoundMessage);
      }
    }),
  delete: t.procedure
    .use(authGuard(["admin"]))
    .input(z.string())
    .mutation(async ({ ctx, input: id }) => {
      if (ctx.session?.user.id === id)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can't delete self admin account",
        });

      try {
        const user = await ctx.prisma.user.delete({
          where: { id },
          select: { username: true },
        });

        return {
          message: `User '${user.username}' deleted succesfully`,
        };
      } catch (e) {
        throw mutationError(e, notFoundMessage);
      }
    }),
});

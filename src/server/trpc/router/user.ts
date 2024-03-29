import { userListQuery, userReviewerQuery } from "../../queries";
import { paginationMetadata, getPaginationQuery } from "../../utils/pagination";
import { getOrderQuery } from "../../utils/sortOrder";
import { t } from "../trpc";
import { authGuard } from "../middlewares/authGuard";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { newUserValidator, updateUserValidator } from "../../validators/user";
import passwordEncryptor from "../../utils/passwordEncryptor";
import mutationError from "../../utils/mutationError";
import { ROLE_MAP } from "../../../constants/role";
import { getRoleNumbers } from "../../../utils/role";
import { Prisma } from "@prisma/client";

const notFoundMessage = "User not found";

export const userRouter = t.router({
  create: t.procedure
    .use(authGuard(["admin"]))
    .input(newUserValidator)
    .mutation(async ({ ctx, input }) => {
      const expertise = input.profile.expertise.replace(/\s/g, "").split(",");
      const keywords = input.profile.keywords?.replace(/\s/g, "").split(",");

      //For some reason, zod refine is not running
      try {
        const user = await ctx.prisma.user.create({
          data: {
            ...input,
            password: passwordEncryptor(input.password),
            profile: {
              create: { ...input.profile, expertise, keywords },
            },
          },
          select: {
            id: true,
            username: true,
          },
        });

        return `User '${user.username}' successfully created`;
      } catch (e) {
        throw mutationError(e);
      }
    }),
  get: t.procedure
    .use(authGuard(["admin"]))
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input },
        select: {
          id: true,
          username: true,
          password: false,
          role: true,
          isActivated: true,
          createdAt: true,
          profile: true,
        },
      });

      if (!user)
        throw new TRPCError({ code: "NOT_FOUND", message: notFoundMessage });

      return user;
    }),
  list: t.procedure
    .use(authGuard(["admin"]))
    .input(userListQuery)
    .query(async ({ ctx, input }) => {
      const profileOrder = getOrderQuery(input, ["email", "name", "country"]);

      const getCount = ctx.prisma.user.count();

      const getUsers = ctx.prisma.user.findMany({
        ...getPaginationQuery(input),
        orderBy: profileOrder
          ? {
              profile: { ...profileOrder },
            }
          : getOrderQuery(input, [
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
        ...paginationMetadata(totalCount, input),
        users,
      };
    }),
  reviewer: t.procedure
    .use(authGuard(["chief"]))
    .input(userReviewerQuery)
    .query(async ({ ctx, input }) => {
      const profileOrder = getOrderQuery(input, ["email", "name", "country"]);

      const filter = {
        AND: [
          {
            OR: getRoleNumbers("reviewer").map((equals) => ({
              role: { equals },
            })),
          },
          { isActivated: true },
        ],
      } as Prisma.UserWhereInput;

      const getCount = ctx.prisma.user.count({
        where: filter,
      });
      const getUsers = ctx.prisma.user.findMany({
        ...getPaginationQuery(input),
        where: filter,
        orderBy: profileOrder
          ? {
              profile: profileOrder,
            }
          : getOrderQuery(input, ["username"]) ?? {
              username: "asc",
            },
        select: {
          id: true,
          username: true,
          profile: { select: { email: true, name: true, country: true } },
          invitations: {
            where: { team: { manuscript: { id: input.manuscriptId } } },
            orderBy: { updatedAt: "desc" },
            take: 1,
            select: { status: true },
          },
        },
      });

      const [totalCount, users] = await ctx.prisma.$transaction([
        getCount,
        getUsers,
      ]);

      return {
        ...paginationMetadata(totalCount, input),
        users,
      };
    }),
  update: t.procedure
    .use(authGuard())
    .input(updateUserValidator)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.session!;
      const requestRole = ROLE_MAP[user.role];

      if (!requestRole || (input.id !== user.id && !requestRole.isAdmin))
        throw new TRPCError({
          message: "Unauthenticated, please re-log in",
          code: "UNAUTHORIZED",
        });

      try {
        const expertise = input.profile.expertise.replace(/\s/g, "").split(",");
        const keywords = input.profile.keywords?.replace(/\s/g, "").split(",");

        const { username } = await ctx.prisma.user.update({
          where: {
            id: input.id,
          },
          data: {
            username: input.username,
            role: requestRole.isAdmin ? input.role : undefined,
            profile: {
              update: {
                ...input.profile,
                expertise,
                keywords,
              },
            },
          },
          select: {
            username: true,
          },
        });

        return `User '${username}' has been updated`;
      } catch (e) {
        throw mutationError(e, notFoundMessage);
      }
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
      if (ctx.session.user.id === input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can't modify activation on own account",
        });
      }

      try {
        const { username } = await ctx.prisma.user.update({
          where: { id: input.id },
          data: { isActivated: input.isActivated },
          select: { username: true },
        });

        return `User '${username}' has been ${
          input.isActivated ? "activated" : "deactivated"
        }`;
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

        return `User '${user.username}' deleted successfully`;
      } catch (e) {
        throw mutationError(e, notFoundMessage);
      }
    }),
});

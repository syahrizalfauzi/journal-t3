import { t } from "../trpc";
import { authGuard } from "../authGuard";
import { manuscriptValidators } from "../../validators/manuscript";
import { HISTORY_STATUS } from "../../../constants/numbers";
import {
  manuscriptAuthorQuery,
  manuscriptChiefQuery,
  manuscriptReviewerQuery,
} from "../../queries";
import { Prisma } from "@prisma/client";
import { getOrderQuery } from "../../utils/sortOrder";
import { paginationMetadata, paginationQuery } from "../../utils/pagination";

export const manuscriptRoute = t.router({
  create: t.procedure
    .use(authGuard(["author"]))
    .input(manuscriptValidators)
    .mutation(async ({ ctx, input }) => {
      const keywords = input.keywords
        .replace(/\s/g, "")
        .toLowerCase()
        .split(",");

      const manuscriptCreate = ctx.prisma.manuscript.create({
        data: {
          ...input,
          authorId: ctx.session!.user.id,
          isBlind: true,
          keywords: {
            connectOrCreate: keywords.map((keyword) => ({
              create: { keyword },
              where: { keyword },
            })),
          },
          history: {
            create: {
              status: HISTORY_STATUS.submitted,
              submission: {
                create: {
                  fileUrl: input.fileUrl,
                },
              },
            },
          },
        },
        select: {
          id: true,
          history: { select: { id: true }, take: 1 },
        },
      });

      // const chiefEmailFetch = ctx.prisma.user.findMany({
      //   where: {
      //     OR: getRoleNumbers("chief").map((e) => ({
      //       role: e,
      //     })),
      //   },
      //   select: { profile: { select: { email: true } } },
      // });

      const [manuscript] = await ctx.prisma.$transaction([
        manuscriptCreate,
        // chiefEmailFetch,
      ]);

      await ctx.prisma.latestHistory.create({
        data: {
          history: { connect: { id: manuscript.history[0]?.id } },
          manuscript: { connect: { id: manuscript.id } },
        },
      });

      return manuscript;
    }),
  listForChief: t.procedure
    .use(authGuard(["chief"]))
    .input(manuscriptChiefQuery)
    .query(async ({ ctx, input }) => {
      const filter = input.filter?.status
        ? ({
            latestHistory: { history: { status: Number(input.filter.status) } },
          } as Prisma.ManuscriptWhereInput)
        : undefined;

      const historyOrder = getOrderQuery({ ...input }, ["status", "updatedAt"]);

      const getCount = ctx.prisma.manuscript.count({
        where: filter,
      });
      const getManuscripts = ctx.prisma.manuscript.findMany({
        ...paginationQuery(input),
        where: filter,
        orderBy: historyOrder
          ? { latestHistory: { history: { ...historyOrder } } }
          : getOrderQuery({ ...input }, ["createdAt", "title"]) ?? {
              createdAt: "desc",
            },

        select: {
          id: true,
          title: true,
          createdAt: true,
          latestHistory: {
            select: {
              history: {
                select: {
                  updatedAt: true,
                  status: true,
                  review: {
                    select: {
                      decision: true,
                      dueDate: true,
                    },
                  },
                },
              },
            },
          },
          keywords: {
            select: { keyword: true },
          },
          author: { select: { profile: { select: { name: true } } } },
        },
      });

      const [totalCount, manuscripts] = await ctx.prisma.$transaction([
        getCount,
        getManuscripts,
      ]);

      return {
        ...paginationMetadata(totalCount, input),
        manuscripts,
      };
    }),
  listForAuthor: t.procedure
    .use(authGuard(["author"]))
    .input(manuscriptAuthorQuery)
    .query(async ({ ctx, input }) => {
      const filter = {
        authorId: ctx.session?.user.id,
        ...(input.filter?.status
          ? {
              latestHistory: {
                history: { status: Number(input.filter.status) },
              },
            }
          : undefined),
      } as Prisma.ManuscriptWhereInput;

      const historyOrder = getOrderQuery({ ...input }, ["updatedAt"]);

      const getCount = ctx.prisma.manuscript.count({
        where: filter,
      });

      const getManuscripts = ctx.prisma.manuscript.findMany({
        ...paginationQuery(input),
        where: filter,
        orderBy: historyOrder
          ? {
              latestHistory: { history: { ...historyOrder } },
            }
          : {
              ...(getOrderQuery({ ...input }, ["createdAt", "title"]) ?? {
                createdAt: "desc",
              }),
            },
        select: {
          id: true,
          title: true,
          createdAt: true,
          latestHistory: {
            select: {
              history: {
                select: {
                  updatedAt: true,
                  status: true,
                  review: { select: { decision: true } },
                },
              },
            },
          },
          keywords: {
            select: { keyword: true },
          },
        },
      });

      const [totalCount, manuscripts] = await ctx.prisma.$transaction([
        getCount,
        getManuscripts,
      ]);

      return {
        ...paginationMetadata(totalCount, input),
        manuscripts,
      };
    }),
  listForReviewer: t.procedure
    .use(authGuard(["reviewer"]))
    .input(manuscriptReviewerQuery)
    .query(async ({ ctx, input }) => {
      const filter = {
        team: { users: { some: { id: ctx.session?.user.id } } },
        history: {
          some: {
            status: {
              gte: HISTORY_STATUS.inviting,
              lte: HISTORY_STATUS.revision,
            },
            review: {
              assesment: input.filter?.assessed
                ? [
                    undefined,
                    { none: { userId: ctx.session?.user.id } },
                    { some: { userId: ctx.session?.user.id, isDone: true } },
                  ][Number(input.filter.assessed)]
                : undefined,
            },
          },
        },
      } as Prisma.ManuscriptWhereInput;

      const historyOrder = getOrderQuery(input, ["updatedAt"]);

      const getCount = ctx.prisma.manuscript.count({
        where: filter,
      });

      const getManuscripts = ctx.prisma.manuscript.findMany({
        ...paginationQuery(input),
        where: filter,
        orderBy: historyOrder
          ? {
              latestHistory: { history: { ...historyOrder } },
            }
          : {
              ...(getOrderQuery(input, ["createdAt", "title"]) ?? {
                createdAt: "desc",
              }),
            },
        select: {
          id: true,
          title: true,
          createdAt: true,
          team: {
            select: { users: { select: { id: true }, orderBy: { id: "asc" } } },
          },
          history: {
            where: {
              status: {
                gte: HISTORY_STATUS.inviting,
                lte: HISTORY_STATUS.revision,
              },
            },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              updatedAt: true,
              status: true,
              review: {
                select: {
                  dueDate: true,
                  assesment: {
                    where: { userId: ctx.session?.user.id, isDone: true },
                    select: { decision: true },
                  },
                },
              },
            },
          },
        },
      });

      const [totalCount, manuscripts] = await ctx.prisma.$transaction([
        getCount,
        getManuscripts,
      ]);

      const mappedManuscripts = manuscripts.map((e) => ({
        ...e,
        team: undefined,
        reviewerNumber:
          (e.team?.users.findIndex(({ id }) => ctx.session?.user.id === id) ??
            -1) + 1,
      }));

      return {
        ...paginationMetadata(totalCount, input),
        manuscripts: mappedManuscripts,
      };
    }),
});

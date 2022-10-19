import { t } from "../trpc";
import { authGuard } from "../middlewares/authGuard";
import {
  manuscriptValidator,
  updateOptionalFileValidator,
} from "../../validators/manuscript";
import { HISTORY_STATUS } from "../../../constants/numbers";
import {
  manuscriptAuthorQuery,
  manuscriptChiefQuery,
  manuscriptReviewerQuery,
} from "../../queries";
import { Prisma } from "@prisma/client";
import { getOrderQuery } from "../../utils/sortOrder";
import { paginationMetadata, paginationQuery } from "../../utils/pagination";
import { z } from "zod";
import {
  AUTHOR_HISTORY_SELECTION,
  CHIEF_HISTORY_SELECTION,
  REVIEWER_HISTORY_SELECTION,
} from "../../../constants/historySelections";
import { TRPCError } from "@trpc/server";
import mutationError from "../../utils/mutationError";

const notFoundMessage = "Manuscript not found";

export const manuscriptRouter = t.router({
  create: t.procedure
    .use(authGuard(["author"]))
    .input(manuscriptValidator)
    .mutation(async ({ ctx, input }) => {
      const keywords = input.keywords
        .replace(/\s/g, "")
        .toLowerCase()
        .split(",");

      const { fileUrl, ...manuscriptInput } = input;

      const manuscriptCreate = ctx.prisma.manuscript.create({
        data: {
          ...manuscriptInput,
          authorId: ctx.session.user.id,
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
                  fileUrl,
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
      const filter =
        input.filter?.key === "status"
          ? ({
              latestHistory: {
                history: { status: Number(input.filter.value) },
              },
            } as Prisma.ManuscriptWhereInput)
          : undefined;

      const historyOrder = getOrderQuery(input, ["status", "updatedAt"]);

      const getCount = ctx.prisma.manuscript.count({
        where: filter,
      });
      const getManuscripts = ctx.prisma.manuscript.findMany({
        ...paginationQuery(input),
        where: filter,
        orderBy: historyOrder
          ? { latestHistory: { history: { ...historyOrder } } }
          : getOrderQuery(input, ["createdAt", "title"]) ?? {
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
        authorId: ctx.session.user.id,
        ...(input.filter?.key === "status"
          ? {
              latestHistory: {
                history: { status: Number(input.filter.value) },
              },
            }
          : undefined),
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
        team: { users: { some: { id: ctx.session.user.id } } },
        history: {
          some: {
            status: {
              gte: HISTORY_STATUS.inviting,
              lte: HISTORY_STATUS.revision,
            },
            review: {
              assesment:
                input.filter?.key === "assessed"
                  ? [
                      undefined,
                      { none: { userId: ctx.session.user.id } },
                      { some: { userId: ctx.session.user.id, isDone: true } },
                    ][Number(input.filter.value)]
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
                    where: { userId: ctx.session.user.id, isDone: true },
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
          (e.team?.users.findIndex(({ id }) => ctx.session.user.id === id) ??
            -1) + 1,
      }));

      return {
        ...paginationMetadata(totalCount, input),
        manuscripts: mappedManuscripts,
      };
    }),
  getForChief: t.procedure
    .use(authGuard(["chief"]))
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const manuscript = await ctx.prisma.manuscript.findUnique({
        where: { id: input },
        select: {
          id: true,
          isBlind: true,
          title: true,
          createdAt: true,
          abstract: true,
          authors: true,
          coverFileUrl: true,
          optionalFileUrl: true,
          keywords: { select: { keyword: true } },
          team: {
            select: {
              users: {
                select: { id: true, profile: { select: { name: true } } },
                orderBy: { id: "asc" },
              },
            },
          },
          history: {
            orderBy: { createdAt: "desc" },
            select: CHIEF_HISTORY_SELECTION,
          },
          author: {
            select: {
              profile: { select: { name: true, email: true, country: true } },
            },
          },
        },
      });

      if (!manuscript)
        throw new TRPCError({ code: "NOT_FOUND", message: notFoundMessage });

      return manuscript;
    }),
  getForReviewer: t.procedure
    .use(authGuard(["reviewer"]))
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const manuscript = await ctx.prisma.manuscript.findFirst({
        where: {
          AND: [
            { id: input },
            { team: { users: { some: { id: ctx.session.user.id } } } },
          ],
        },
        select: {
          id: true,
          isBlind: true,
          title: true,
          createdAt: true,
          abstract: true,
          authors: true,
          coverFileUrl: true,
          optionalFileUrl: true,
          author: {
            select: {
              profile: { select: { name: true, email: true, country: true } },
            },
          },
          team: {
            select: { users: { select: { id: true }, orderBy: { id: "asc" } } },
          },
          keywords: { select: { keyword: true } },
          history: {
            where: {
              status: {
                gte: HISTORY_STATUS.inviting,
                lte: HISTORY_STATUS.revision,
              },
            },
            orderBy: { createdAt: "desc" },
            select: REVIEWER_HISTORY_SELECTION,
          },
        },
      });

      if (!manuscript)
        throw new TRPCError({ code: "NOT_FOUND", message: notFoundMessage });

      return manuscript;
    }),
  getForAuthor: t.procedure
    .use(authGuard(["author"]))
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const manuscript = await ctx.prisma.manuscript.findFirst({
        where: { id: input },
        select: {
          id: true,
          title: true,
          createdAt: true,
          abstract: true,
          authors: true,
          authorId: true,
          coverFileUrl: true,
          optionalFileUrl: true,
          keywords: { select: { keyword: true } },
          latestHistory: {
            select: { history: { select: AUTHOR_HISTORY_SELECTION } },
          },
        },
      });

      if (!manuscript)
        throw new TRPCError({ code: "NOT_FOUND", message: notFoundMessage });

      return manuscript;
    }),
  updateOptionalFile: t.procedure
    .use(authGuard(["author"]))
    .input(updateOptionalFileValidator)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.manuscript.update({
          where: { id: input.id },
          data: { optionalFileUrl: input.optionalFileUrl },
        });
        return "Successfully uploaded optional file";
      } catch (e) {
        throw mutationError(e, notFoundMessage);
      }
    }),
  deleteOptionalFile: t.procedure
    .use(authGuard(["chief"]))
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        const manuscript = await ctx.prisma.manuscript.delete({
          where: { id: input },
          select: { title: true },
        });
        return `Deleted manuscript '${manuscript.title}'`;
      } catch (e) {
        throw mutationError(e, notFoundMessage);
      }
    }),
});

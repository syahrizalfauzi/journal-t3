import { editionListQuery } from "../../queries";
import {
  editionValidator,
  updateEditionValidator,
} from "../../validators/edition";
import { authGuard } from "../middlewares/authGuard";
import { t } from "../trpc";
import { getPaginationQuery, paginationMetadata } from "../../utils/pagination";
import { getOrderQuery } from "../../utils/sortOrder";
import { EDITION_LIST_SORTS } from "../../../constants/sorts";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import mutationError from "../../utils/mutationError";
import { Prisma } from "@prisma/client";

const notFoundMessage = "Edition not found";

export const editionRouter = t.router({
  create: t.procedure
    .use(authGuard(["chief"]))
    .input(editionValidator)
    .mutation(async ({ ctx, input }) => {
      const { id } = await ctx.prisma.edition.create({
        data: input,
        select: { id: true },
      });

      return `Edition successfully created (ID:${id})`;
    }),
  listArchive: t.procedure
    .input(editionListQuery)
    .query(async ({ ctx, input }) => {
      const filter = {
        isAvailable: true,
      } as Prisma.EditionWhereInput;

      const getCount = ctx.prisma.edition.count({
        where: filter,
      });
      const getEditions = ctx.prisma.edition.findMany({
        ...getPaginationQuery(input),
        where: filter,
        orderBy: getOrderQuery(input, EDITION_LIST_SORTS),
        select: {
          id: true,
          name: true,
          doi: true,
          _count: { select: { manuscripts: true } },
        },
      });

      const [totalCount, editions] = await ctx.prisma.$transaction([
        getCount,
        getEditions,
      ]);

      return {
        ...paginationMetadata(totalCount, input),
        editions,
      };
    }),
  list: t.procedure
    .use(authGuard(["chief"]))
    .input(editionListQuery)
    .query(async ({ ctx, input }) => {
      const filter = {
        isAvailable: !input.filter ? undefined : input.filter?.value === "true",
      } as Prisma.EditionWhereInput;

      const getCount = ctx.prisma.edition.count({
        where: filter,
      });
      const getEditions = ctx.prisma.edition.findMany({
        ...getPaginationQuery(input),
        where: filter,
        orderBy: getOrderQuery(input, EDITION_LIST_SORTS),
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          doi: true,
          isAvailable: true,
          _count: { select: { manuscripts: true } },
        },
      });

      const [totalCount, editions] = await ctx.prisma.$transaction([
        getCount,
        getEditions,
      ]);

      return {
        ...paginationMetadata(totalCount, input),
        editions,
      };
    }),
  listShort: t.procedure.use(authGuard(["chief"])).query(async ({ ctx }) => {
    const editions = await ctx.prisma.edition.findMany({
      where: { isAvailable: false },
      select: {
        id: true,
        name: true,
        doi: true,
      },
    });

    return editions;
  }),
  getLatest: t.procedure.query(async ({ ctx }) => {
    const settings = await ctx.prisma.settings.findFirst();
    const edition = await ctx.prisma.edition.findFirst({
      where: { isAvailable: true },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        name: true,
        manuscripts: {
          orderBy: {
            latestHistory: {
              history: {
                updatedAt: "desc",
              },
            },
          },
          take: settings?.maxArticlesPerLatestEdition ?? 5,
          select: {
            id: true,
            title: true,
            authors: true,
            keywords: true,
            latestHistory: {
              select: {
                history: {
                  select: {
                    updatedAt: true,
                    submission: { select: { fileUrl: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    return edition;
  }),
  get: t.procedure
    .use(authGuard(["chief"]))
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const edition = await ctx.prisma.edition.findUnique({
        where: { id: input },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          doi: true,
          isAvailable: true,
          manuscripts: {
            select: {
              id: true,
              title: true,
              authors: true,
              keywords: true,
              latestHistory: {
                select: {
                  history: {
                    select: {
                      updatedAt: true,
                      submission: { select: { fileUrl: true } },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!edition)
        throw new TRPCError({ code: "NOT_FOUND", message: notFoundMessage });

      return edition;
    }),
  update: t.procedure
    .use(authGuard(["chief"]))
    .input(updateEditionValidator)
    .mutation(async ({ ctx, input }) => {
      try {
        const { name } = await ctx.prisma.edition.update({
          where: { id: input.id },
          select: { name: true },
          data: input,
        });

        return `Edition '${name}' has been updated`;
      } catch (e) {
        throw mutationError(e, notFoundMessage);
      }
    }),
  delete: t.procedure
    .use(authGuard(["chief"]))
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        const { name } = await ctx.prisma.edition.delete({
          where: { id: input },
          select: { name: true },
        });

        return `Edition '${name}' has been deleted`;
      } catch (e) {
        throw mutationError(e, notFoundMessage);
      }
    }),
});

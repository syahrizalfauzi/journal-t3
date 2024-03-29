import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PAGE_LIST_SORTS } from "../../../constants/sorts";
import { parseUrlString } from "../../../utils/parseUrlString";
import { pageListQuery } from "../../queries";
import mutationError from "../../utils/mutationError";
import { getPaginationQuery, paginationMetadata } from "../../utils/pagination";
import { getOrderQuery } from "../../utils/sortOrder";
import { pageValidator, updatePageValidator } from "../../validators/page";
import { authGuard } from "../middlewares/authGuard";
import { t } from "../trpc";

const notFoundMessage = "Page not found";

export const pageRouter = t.router({
  create: t.procedure
    .use(authGuard(["admin"]))
    .input(pageValidator)
    .mutation(async ({ ctx, input }) => {
      const trimmedInputUrl = parseUrlString(input.url);

      const samePage = await ctx.prisma.page.findUnique({
        where: {
          url: trimmedInputUrl,
        },
      });

      if (!!samePage) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Url is already used",
        });
      }

      try {
        const { name } = await ctx.prisma.page.create({
          data: {
            name: input.name,
            url: trimmedInputUrl,
            data: input.data,
          },
          select: { name: true },
        });

        return `Page ${name} created`;
      } catch (e) {
        throw mutationError(e);
      }
    }),
  list: t.procedure
    .use(authGuard(["admin"]))
    .input(pageListQuery)
    .query(async ({ ctx, input }) => {
      const getCount = ctx.prisma.page.count();
      const getPages = ctx.prisma.page.findMany({
        ...getPaginationQuery(input),
        orderBy: getOrderQuery(input, PAGE_LIST_SORTS),
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          url: true,
        },
      });

      const [totalCount, pages] = await ctx.prisma.$transaction([
        getCount,
        getPages,
      ]);

      return {
        ...paginationMetadata(totalCount, input),
        pages,
      };
    }),
  get: t.procedure
    .use(authGuard(["admin"]))
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const page = await ctx.prisma.page.findUnique({
        where: { id: input },
        select: {
          id: true,
          name: true,
          data: true,
          updatedAt: true,
          url: true,
        },
      });

      if (!page)
        throw new TRPCError({ code: "NOT_FOUND", message: notFoundMessage });

      return page;
    }),
  update: t.procedure
    .use(authGuard(["admin"]))
    .input(updatePageValidator)
    .mutation(async ({ ctx, input }) => {
      const trimmedInputUrl = parseUrlString(input.url);

      try {
        const { name } = await ctx.prisma.page.update({
          where: {
            id: input.id,
          },
          data: {
            data: input.data,
            name: input.name,
            url: trimmedInputUrl,
          },
          select: {
            name: true,
          },
        });
        return `Page '${name}' has been updated`;
      } catch (e) {
        throw mutationError(e, notFoundMessage);
      }
    }),
  delete: t.procedure
    .use(authGuard(["admin"]))
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        const { name } = await ctx.prisma.page.delete({
          where: { id: input },
          select: {
            name: true,
          },
        });
        return `Page '${name}' has been deleted`;
      } catch (e) {
        throw mutationError(e, notFoundMessage);
      }
    }),
});

export default pageRouter;

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PAGE_LIST_SORTS } from "../../../constants/sorts";
import { pageListQuery } from "../../queries";
import mutationError from "../../utils/mutationError";
import { getPaginationQuery, paginationMetadata } from "../../utils/pagination";
import { getOrderQuery } from "../../utils/sortOrder";
import { updatePageValidator } from "../../validators/page";
import { authGuard } from "../middlewares/authGuard";
import { t } from "../trpc";

const notFoundMessage = "Page not found";

export const pageRouter = t.router({
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
        },
      });

      if (!page)
        throw new TRPCError({ code: "NOT_FOUND", message: notFoundMessage });

      return page;
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
  update: t.procedure
    .use(authGuard(["admin"]))
    .input(updatePageValidator)
    .mutation(async ({ ctx, input }) => {
      try {
        const { name } = await ctx.prisma.page.update({
          where: {
            id: input.id,
          },
          data: {
            data: input.data,
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
});

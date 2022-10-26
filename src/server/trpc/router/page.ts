import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PAGE_LIST_SORTS } from "../../../constants/sorts";
import { pageListQuery } from "../../queries";
import mutationError from "../../utils/mutationError";
import { getPaginationQuery, paginationMetadata } from "../../utils/pagination";
import { getOrderQuery } from "../../utils/sortOrder";
import { pageValidator, updatePageValidator } from "../../validators/page";
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
          url: true,
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
  create: t.procedure
    .use(authGuard(["admin"]))
    .input(pageValidator)
    .mutation(async ({ ctx, input }) => {
      try {
        const { name } = await ctx.prisma.page.create({
          data: {
            name: input.name,
            url: input.url.startsWith("/") ? input.url : `/${input.url}`,
            data: input.data,
          },
          select: { name: true },
        });

        return `Page ${name} created`;
      } catch (e) {
        throw mutationError(e);
      }
    }),
  update: t.procedure
    .use(authGuard(["admin"]))
    .input(updatePageValidator)
    .mutation(async ({ ctx, input }) => {
      const inputUrlArray = input.url
        .split("/")
        .filter((segment) => segment !== "");

      const pagesWithInputUrl = (
        await ctx.prisma.page.findMany({
          where: {
            AND: [
              { OR: inputUrlArray.map((url) => ({ url: { contains: url } })) },
              { id: { not: input.id } },
            ],
          },
          select: { url: true },
        })
      ).map((page) => page.url.split("/").filter((segment) => segment !== ""));

      const isUrlUsed = pagesWithInputUrl.some((pageUrlArray) => {
        if (pageUrlArray.length !== inputUrlArray.length) {
          return false;
        }
        return pageUrlArray.every((url, index) => url === inputUrlArray[index]);
      });

      if (isUrlUsed) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Url is already used",
        });
      }

      try {
        const { name } = await ctx.prisma.page.update({
          where: {
            id: input.id,
          },
          data: {
            data: input.data,
            name: input.name,
            url: input.url.startsWith("/") ? input.url : `/${input.url}`,
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

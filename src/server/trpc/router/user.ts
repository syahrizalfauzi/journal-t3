import { Prisma } from "@prisma/client";
import { userListQuery } from "../../queries/user";
import { paginationQuery, paginationMetadata } from "../../utils/pagination";
import { getOrderQuery } from "../../utils/sortOrder";
import { t } from "../trpc";

export const userRouter = t.router({
  list: t.procedure.input(userListQuery).query(async ({ ctx, input }) => {
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
});

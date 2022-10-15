import { t } from "../trpc";
import { authGuard } from "../authGuard";
import { manuscriptValidators } from "../../validators/manuscript";
import { HISTORY_STATUS } from "../../../constants/numbers";

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
});

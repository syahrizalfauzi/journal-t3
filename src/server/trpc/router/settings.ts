import { t } from "../trpc";
import { authGuard } from "../middlewares/authGuard";
import { Settings } from "@prisma/client";
import {
  DEFAULT_MAX_ARTICLES_PER_LATEST_EDITION,
  DEFAULT_REVIEWERS_COUNT,
} from "../../../constants/numbers";
import { settingsValidator } from "../../validators/settings";

export const settingsRouter = t.router({
  get: t.procedure.use(authGuard(["chief", "admin"])).query(async ({ ctx }) => {
    const settings = await ctx.prisma.settings.findFirst({});

    return (
      settings ??
      ({
        id: "settings",
        maxArticlesPerLatestEdition: DEFAULT_MAX_ARTICLES_PER_LATEST_EDITION,
        reviewersCount: DEFAULT_REVIEWERS_COUNT,
      } as Settings)
    );
  }),
  update: t.procedure
    .use(authGuard(["chief", "admin"]))
    .input(settingsValidator)
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.settings.upsert({
        where: { id: "settings" },
        update: {
          maxArticlesPerLatestEdition: input.maxArticlesPerLatestEdition,
          reviewersCount: input.reviewersCount,
        },
        create: {
          id: "settings",
          maxArticlesPerLatestEdition: input.maxArticlesPerLatestEdition,
          reviewersCount: input.reviewersCount,
        },
      });

      return "Settings successfully updated";
    }),
});

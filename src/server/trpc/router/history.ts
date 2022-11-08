import { t } from "../trpc";
import {
  acceptHistoryValidator,
  finalizeHistoryValidator,
  proofreadHistoryValidator,
  publishHistoryValidator,
  rejectHistoryValidator,
  reviseHistoryValidator,
} from "../../validators/history";
import { previousHistoryGuard } from "../middlewares/previousHistoryGuard";
import { HISTORY_STATUS, REVIEW_DECISION } from "../../../constants/numbers";
import { TRPCError } from "@trpc/server";
import { CHIEF_HISTORY_SELECTION } from "../../../constants/historySelections";
import { authGuard } from "../middlewares/authGuard";

//Kalo error, flip input & usenya

export const historyRouter = t.router({
  reject: t.procedure
    .use(authGuard(["chief"]))
    .input(rejectHistoryValidator)
    .use(previousHistoryGuard(rejectHistoryValidator, "submitted"))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.previousHistory.submission)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File URL doesn't exist on the submitted history",
        });

      const { id, manuscript } = await ctx.prisma.history.create({
        data: {
          status: HISTORY_STATUS.rejected,
          submission: {
            create: {
              fileUrl: ctx.previousHistory.submission.fileUrl,
              message: input.reason,
            },
          },
          manuscript: { connect: { id: input.manuscriptId } },
        },
        select: {
          ...CHIEF_HISTORY_SELECTION,
          id: true,
          manuscript: { select: { title: true } },
          // author: { select: { profile: { select: { email: true } } } },
        },
      });

      await ctx.prisma.latestHistory.update({
        where: { manuscriptId: input.manuscriptId },
        data: { history: { connect: { id } } },
      });

      return `Manuscript is successfully rejected (${manuscript.title})`;
    }),
  accept: t.procedure
    .use(authGuard(["chief"]))
    .input(acceptHistoryValidator)
    .use(previousHistoryGuard(acceptHistoryValidator, "submitted"))
    .mutation(async ({ ctx, input }) => {
      const historyCreate = ctx.prisma.history.create({
        data: {
          status: HISTORY_STATUS.inviting,
          submission: { create: { fileUrl: input.fileUrl } },
          manuscript: { connect: { id: input.manuscriptId } },
        },
        select: { ...CHIEF_HISTORY_SELECTION, id: true },
      });

      const teamCreate = ctx.prisma.team.create({
        data: { manuscript: { connect: { id: input.manuscriptId } } },
        select: {
          id: true,
          users: { select: { profile: { select: { name: true } } } },
        },
      });

      const manuscriptUpdate = ctx.prisma.manuscript.update({
        where: { id: input.manuscriptId },
        data: { isBlind: input.isBlind },
        select: { title: true },
        // author: { select: { profile: { select: { email: true } } } },
      });

      const [{ id }, { title }] = await ctx.prisma.$transaction([
        historyCreate,
        manuscriptUpdate,
        teamCreate,
      ]);

      await ctx.prisma.latestHistory.update({
        where: { manuscriptId: input.manuscriptId },
        data: { history: { connect: { id } } },
      });

      return `Manuscript is successfully accepted (${title})`;
    }),
  revise: t.procedure
    .use(authGuard(["author"]))
    .input(reviseHistoryValidator)
    .use(previousHistoryGuard(reviseHistoryValidator, "reviewed"))
    .mutation(async ({ ctx, input }) => {
      const { review } = ctx.previousHistory;

      if (!review)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review to revise not found",
        });

      if (review.decision !== REVIEW_DECISION.revision)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Review decision is not revise (${review.decision})`,
        });

      const { id } = await ctx.prisma.history.create({
        data: {
          status: HISTORY_STATUS.revision,
          manuscript: { connect: { id: input.manuscriptId } },
          submission: { create: { fileUrl: input.fileUrl } },
          review: { create: { decision: REVIEW_DECISION.unanswered } },
        },
        select: { id: true },
      });

      const latestHistoryUpdate = ctx.prisma.latestHistory.update({
        where: { manuscriptId: input.manuscriptId },
        data: { history: { connect: { id } } },
        select: { manuscript: { select: { id: true, title: true } } },
      });

      // const chiefEmailFetch = ctx.prisma.user.findMany({
      //   where: {
      //     OR: getRoleNumbers("chief").map((e) => ({
      //       role: e,
      //     })),
      //   },
      //   select: { profile: { select: { email: true } } },
      // });

      await ctx.prisma.$transaction([latestHistoryUpdate]);

      return "Revision successfully submitted";
    }),
  proofread: t.procedure
    .use(authGuard(["chief"]))
    .input(proofreadHistoryValidator)
    .use(previousHistoryGuard(proofreadHistoryValidator, "reviewed"))
    .mutation(async ({ ctx, input }) => {
      const { review } = ctx.previousHistory;

      if (!review)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Accepted review to proofread not found",
        });

      if (review.decision !== REVIEW_DECISION.accepted)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Review decision is not revise (${review.decision})`,
        });

      const { id } = await ctx.prisma.history.create({
        data: {
          status: HISTORY_STATUS.proofread,
          manuscript: { connect: { id: input.manuscriptId } },
          submission: { create: { fileUrl: input.fileUrl } },
        },
        select: { id: true },
      });

      await ctx.prisma.latestHistory.update({
        where: { manuscriptId: input.manuscriptId },
        data: { history: { connect: { id } } },
      });

      return "Proofread article successfully submitted";
    }),
  finalize: t.procedure
    .use(authGuard(["author"]))
    .input(finalizeHistoryValidator)
    .use(previousHistoryGuard(finalizeHistoryValidator, "proofread"))
    .mutation(async ({ ctx, input }) => {
      const { submission } = ctx.previousHistory;

      if (!input.fileUrl && !submission)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No file to finalize & previous file not found",
        });

      const history = await ctx.prisma.history.create({
        data: {
          status: HISTORY_STATUS.finalized,
          manuscript: { connect: { id: input.manuscriptId } },
          submission: input.fileUrl
            ? { create: { fileUrl: input.fileUrl } }
            : { connect: { id: submission?.id } },
        },
        select: { id: true },
      });

      const latestHistoryUpdate = ctx.prisma.latestHistory.update({
        where: { manuscriptId: input.manuscriptId },
        data: { history: { connect: { id: history.id } } },
      });

      // const chiefEmailFetch = ctx.prisma.user.findMany({
      //   where: {
      //     OR: getRoleNumbers("chief").map((e) => ({
      //       role: e,
      //     })),
      //   },
      //   select: { profile: { select: { email: true } } },
      // });

      await ctx.prisma.$transaction([latestHistoryUpdate]);
      // chiefEmailFetch,

      return input.fileUrl
        ? "Revised article successfully submitted"
        : "Proofread is successfully answered with no revision";
    }),
  publish: t.procedure
    .use(authGuard(["chief"]))
    .input(publishHistoryValidator)
    .use(previousHistoryGuard(publishHistoryValidator, "finalized"))
    .mutation(async ({ ctx, input }) => {
      const { submission } = ctx.previousHistory;

      if (!submission)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Previous file not found",
        });

      const history = await ctx.prisma.history.create({
        data: {
          status: HISTORY_STATUS.published,
          manuscript: { connect: { id: input.manuscriptId } },
          submission: { connect: { id: submission.id } },
        },
        select: { id: true },
      });

      const latestHistoryUpdate = ctx.prisma.latestHistory.update({
        where: { manuscriptId: input.manuscriptId },
        data: { history: { connect: { id: history.id } } },
      });

      const manuscriptUpdate = ctx.prisma.manuscript.update({
        where: { id: input.manuscriptId },
        data: { edition: { connect: { id: input.editionId } } },
        select: {
          id: true,
          title: true,
          edition: { select: { name: true, doi: true } },
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

      const [{ edition, title }] = await ctx.prisma.$transaction([
        manuscriptUpdate,
        latestHistoryUpdate,
      ]);
      // chiefEmailFetch,

      return `Article ${title} successfully published in ${
        edition!.name
      } edition`;
    }),
});

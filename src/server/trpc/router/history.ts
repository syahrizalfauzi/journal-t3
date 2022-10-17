import { t } from "../trpc";
import {
  historyAcceptValidator,
  historyFinalizeValidator,
  historyProofreadValidator,
  historyRejectValidator,
  historyReviseValidator,
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
    .input(historyRejectValidator)
    .use(previousHistoryGuard(historyRejectValidator, "submitted"))
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

      return `Manuscript is successfully rejected (ID: ${manuscript.title})`;
    }),
  accept: t.procedure
    .use(authGuard(["chief"]))
    .input(historyAcceptValidator)
    .use(previousHistoryGuard(historyAcceptValidator, "submitted"))
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

      return `Manuscript is successfully accepted (ID: ${title})`;
    }),
  revise: t.procedure
    .use(authGuard(["author"]))
    .input(historyReviseValidator)
    .use(previousHistoryGuard(historyReviseValidator, "reviewed"))
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

      return `Revision successfully submitted`;
    }),
  proofread: t.procedure
    .use(authGuard(["chief"]))
    .input(historyProofreadValidator)
    .use(previousHistoryGuard(historyProofreadValidator, "reviewed"))
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

      return `Review successfully accepted`;
    }),
  finalize: t.procedure
    .use(authGuard(["author"]))
    .input(historyFinalizeValidator)
    .use(previousHistoryGuard(historyFinalizeValidator, "proofread"))
    .mutation(async ({ ctx, input }) => {
      const history = await ctx.prisma.history.create({
        data: {
          status: HISTORY_STATUS.finalized,
          manuscript: { connect: { id: input.manuscriptId } },
          submission: input.fileUrl
            ? { create: { fileUrl: input.fileUrl } }
            : { connect: { id: ctx.previousHistory.submission!.id } },
        },
        select: { id: true },
      });

      const latestHistoryUpdate = ctx.prisma.latestHistory.update({
        where: { manuscriptId: input.manuscriptId },
        data: { history: { connect: { id: history.id } } },
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
      // chiefEmailFetch,

      return input.fileUrl
        ? "Revised article successfully submitted"
        : "Proofread is successfully answered with no revision";
    }),
});

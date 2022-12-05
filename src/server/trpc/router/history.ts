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
import { sendEmail } from "../../utils/sendEmail";
import { sender } from "../../../constants/mailjet";
import { getRoleNumbers } from "../../../utils/role";
import { getBaseUrl } from "../../../utils/trpc";

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
          manuscript: {
            select: {
              title: true,
              author: {
                select: { profile: { select: { email: true, name: true } } },
              },
            },
          },
        },
      });

      const latestHistoryUpdate = ctx.prisma.latestHistory.update({
        where: { manuscriptId: input.manuscriptId },
        data: { history: { connect: { id } } },
      });

      const authorEmailSend = sendEmail({
        Messages: [
          {
            From: sender,
            To: [{ Email: manuscript.author.profile!.email }],
            Subject: "Manuscript Rejected",
            HTMLPart: `<h3>Dear ${manuscript.author.profile!.name},</h3>
              <p>Your manuscript titled <b>${
                manuscript.title
              }</b> has been rejected by the chief editor.</p>
              <p>Reason: ${input.reason}</p>
              <p>Click the link below to open the details </p>
              <p><a href="${getBaseUrl()}/dashboard/author/submissions/${
              input.manuscriptId
            }">Open</a></p>
              <p>Please login to your account to see the details.</p>
              <p>Thank you.</p>`,
          },
        ],
      });

      await Promise.all([latestHistoryUpdate, authorEmailSend]);

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

      const chiefEmailFetch = ctx.prisma.user.findMany({
        where: {
          OR: getRoleNumbers("chief").map((e) => ({
            role: e,
          })),
        },
        select: { profile: { select: { email: true } } },
      });

      const [chiefEmails, latestHistory] = await ctx.prisma.$transaction([
        chiefEmailFetch,
        latestHistoryUpdate,
      ]);

      try {
        await sendEmail({
          Messages: [
            {
              From: sender,
              To: [sender],
              Bcc: chiefEmails
                .filter((e) => !!e.profile)
                .map((e) => ({ Email: e.profile!.email })),
              Subject: "Manuscript Revision",
              HTMLPart: `<h3>Dear Chief Editor,</h3>
              <p>Author has revised the manuscript titled <b>${
                latestHistory.manuscript.title
              }</b>.</p>
              <p>Click the link below to open the details </p>
              <p><a href="${getBaseUrl()}/dashboard/chief/submissions/${
                latestHistory.manuscript.id
              }">Open</a></p>
              <p>Thank you.</p>`,
            },
          ],
        });
      } catch (e) {
        console.log(e);
      }

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

      const { manuscript } = await ctx.prisma.latestHistory.update({
        where: { manuscriptId: input.manuscriptId },
        data: { history: { connect: { id } } },
        select: {
          manuscript: {
            select: {
              id: true,
              title: true,
              author: { select: { profile: { select: { email: true } } } },
            },
          },
        },
      });

      try {
        if (manuscript.author.profile)
          await sendEmail({
            Messages: [
              {
                From: sender,
                To: [{ Email: manuscript.author.profile.email }],
                Subject: "Manuscript Proofread",
                HTMLPart: `<h3>Dear Author,</h3>
              <p>Chief Editor has proofread the manuscript titled <b>${
                manuscript.title
              }</b>.</p>
              <p>Click the link below to open the details </p>
              <p><a href="${getBaseUrl()}/dashboard/author/submissions/${
                  manuscript.id
                }">Open</a></p>
              <p>Thank you.</p>`,
              },
            ],
          });
      } catch (e) {
        console.log(e);
      }

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
        select: { manuscript: { select: { id: true, title: true } } },
      });

      const chiefEmailFetch = ctx.prisma.user.findMany({
        where: {
          OR: getRoleNumbers("chief").map((e) => ({
            role: e,
          })),
        },
        select: { profile: { select: { email: true } } },
      });

      const [chiefEmails, latestHistory] = await ctx.prisma.$transaction([
        chiefEmailFetch,
        latestHistoryUpdate,
      ]);

      try {
        await sendEmail({
          Messages: [
            {
              From: sender,
              To: [sender],
              Bcc: chiefEmails.map((e) => ({ Email: e.profile!.email })),
              Subject: "Manuscript Finalized",
              HTMLPart: `<h3>Dear Chief Editor,</h3>
              <p>Author has finalized the manuscript titled <b>${
                latestHistory.manuscript.title
              }</b>.</p>
              <p>Click the link below to open the details </p>
              <p><a href="${getBaseUrl()}/dashboard/chief/submissions/${
                latestHistory.manuscript.id
              }">Open</a></p>
              <p>Thank you.</p>`,
            },
          ],
        });
      } catch (e) {
        console.log(e);
      }

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
          author: { select: { profile: { select: { email: true } } } },
        },
      });

      const [{ edition, title, id, author }] = await ctx.prisma.$transaction([
        manuscriptUpdate,
        latestHistoryUpdate,
      ]);

      try {
        if (author.profile)
          await sendEmail({
            Messages: [
              {
                From: sender,
                To: [{ Email: author.profile.email }],
                Subject: "Manuscript Published",
                HTMLPart: `<h3>Dear Author,</h3>
              <p>Your manuscript titled <b>${title}</b> has been published.</p>
              <p>Your paper will be available to public once the current journal edition is released </p>
              <p>Click the link below to open the details </p>
              <p><a href="${getBaseUrl()}/dashboard/author/submissions/${id}">Open</a></p>
              <p>Thank you.</p>`,
              },
            ],
          });
      } catch (e) {
        console.log(e);
      }

      return `Article ${title} successfully published in ${
        edition!.name
      } edition`;
    }),
});

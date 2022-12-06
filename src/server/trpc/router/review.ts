import { t } from "../trpc";
import { authGuard } from "../middlewares/authGuard";
import {
  reviewUpdateDecisionValidator,
  reviewUpdateDueValidator,
} from "../../validators/review";
import mutationError from "../../utils/mutationError";
import { HISTORY_STATUS } from "../../../constants/numbers";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sendEmail } from "../../utils/sendEmail";
import { sender } from "../../../constants/mailjet";
import { getBaseUrl } from "../../../utils/trpc";
import { parseDate } from "../../../utils/parseDate";
import { REVIEW_DECISION } from "../../../constants/numbers";

const notFoundMessage = "Review not found";

export const reviewRouter = t.router({
  get: t.procedure
    .use(authGuard(["reviewer", "chief"]))
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const review = await ctx.prisma.review.findUnique({
        where: { id: input },
        include: {
          assesment: {
            select: {
              user: { select: { id: true } },
              id: true,
              decision: true,
              isDone: true,
            },
          },
        },
      });
      if (!review)
        throw new TRPCError({ code: "NOT_FOUND", message: notFoundMessage });

      return review;
    }),
  updateDueDate: t.procedure
    .use(authGuard(["chief"]))
    .input(reviewUpdateDueValidator)
    .mutation(async ({ ctx, input }) => {
      try {
        const { history } = await ctx.prisma.review.update({
          where: { id: input.id },
          data: { dueDate: input.dueDate },
          select: {
            history: {
              select: {
                manuscript: {
                  select: {
                    title: true,
                    id: true,
                    team: {
                      select: {
                        users: {
                          select: { profile: { select: { email: true } } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });

        try {
          if (history.manuscript.team)
            await sendEmail({
              Messages: [
                {
                  From: sender,
                  To: [sender],
                  Bcc: history.manuscript.team.users
                    .filter((e) => !!e.profile)
                    .map((e) => ({ Email: e.profile!.email })),
                  Subject: `New assignment`,
                  HTMLPart: `<h3>Dear Reviewer,</h3>
                  <p>You received a new submission to be reviewed titled <b>${
                    history.manuscript.title
                  }</b>.</p>
                  <p>The due date is <b> ${parseDate(input.dueDate)} </b> </p>
                <p>Click the link below to open the details</p>
                <a href="${getBaseUrl()}/dashboard/reviewer/assignments/${
                    history.manuscript.id
                  }">Open</a>
              <p>Thank you.</p>`,
                },
              ],
            });
        } catch (e) {
          console.log(e);
        }

        return "Due date successfully set";

        // if (review.history.manuscript.team) {
        //   await sendEmail({
        //     bcc: review.history.manuscript.team.users
        //       .filter((e) => e.profile !== null)
        //       .map((e) => e.profile!.email),
        //     subject: "New Assignment",
        //     html: `
        //     <h1>${review.history.manuscript.title}</h1>
        //
        //     <p>You received a new submission to be reviewed with the title above</p>
        //     <p>Due date : <b>${moment(
        //       req.body.dueDate
        //     ).toLocaleString()}</b></p>
        //     <p>Click the link below to open the details</p>
        //     <a href="${frontendOrigin}/dashboard/reviewer/assignments/${
        //       review.history.manuscript.id
        //     }">Assignment detail</a>
        //   `,
        //   });
        // }
      } catch (e) {
        throw mutationError(e, notFoundMessage);
      }
    }),
  updateDecision: t.procedure
    .use(authGuard(["chief"]))
    .input(reviewUpdateDecisionValidator)
    .mutation(async ({ ctx, input }) => {
      const review = await ctx.prisma.review.findFirst({
        where: {
          AND: [
            { id: input.id },
            { history: { status: HISTORY_STATUS.reviewed } },
          ],
        },
        select: { id: true },
      });

      if (!review)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "History status is not 'reviewed' yet",
        });

      const { history } = await ctx.prisma.review.update({
        where: { id: review.id },
        data: {
          ...input,
        },
        select: {
          history: {
            select: {
              manuscript: {
                select: {
                  id: true,
                  title: true,
                  author: { select: { profile: { select: { email: true } } } },
                },
              },
            },
          },
        },
      });

      try {
        if (
          history.manuscript.author.profile &&
          input.decision !== REVIEW_DECISION.accepted
        ) {
          await sendEmail({
            Messages: [
              {
                From: sender,
                To: [{ Email: history.manuscript.author.profile.email }],
                Subject: "Review Result",
                HTMLPart: `<h3>Dear Author,</h3>
                <p>Your manuscript with title <b>${
                  history.manuscript.title
                }</b> has been reviewed</p>
                <p>Click the link below to open the details</p>
                <a href="${getBaseUrl()}/dashboard/author/submissions/${
                  history.manuscript.id
                }">Open</a>
              <p>Thank you.</p>`,
              },
            ],
          });
        }
      } catch (e) {
        console.log(e);
      }

      switch (input.decision) {
        case -1:
          return "Review successfully rejected";
        case 1:
          return "Review is successfully rejected with revision";
      }

      // res.json({ review: reviewUpdate });
      // if (reviewUpdate.history.manuscript.author.profile) {
      //   await sendEmail({
      //     to: reviewUpdate.history.manuscript.author.profile.email,
      //     subject: "Submission Reviewed",
      //     html: `
      //   <h1>${reviewUpdate.history.manuscript.title}</h1>
      //
      //   <p>Your submission with the title above has been peer-reviewed</p>
      //   <p>Click the link below to open the detail</p>
      //   <a href="${frontendOrigin}/dashboard/author/submissions/${reviewUpdate.history.manuscript.id}">Submission detail</a>
      // `,
      //   });
      // }
    }),
});

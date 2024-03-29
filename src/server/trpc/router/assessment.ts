import { t } from "../trpc";
import { authGuard } from "../middlewares/authGuard";
import {
  createAssessmentValidator,
  updateAssessmentValidator,
} from "../../validators/assessment";
import { TRPCError } from "@trpc/server";
import {
  DEFAULT_REVIEWERS_COUNT,
  HISTORY_STATUS,
  REVIEW_DECISION,
} from "../../../constants/numbers";
import mutationError from "../../utils/mutationError";
import { z } from "zod";
import { getRoleNumbers } from "../../../utils/role";
import { sendEmail } from "../../utils/sendEmail";
import { sender } from "../../../constants/mailjet";
import { getBaseUrl } from "../../../utils/trpc";

const notFoundMessage = "Assessment not found";

export const assessmentRouter = t.router({
  create: t.procedure
    .use(authGuard(["reviewer"]))
    .input(createAssessmentValidator)
    .mutation(async ({ ctx, input }) => {
      if (input.isDone && input.decision === REVIEW_DECISION.unanswered)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Decision required to submit",
        });

      const existingAssesment = await ctx.prisma.assesment.findFirst({
        where: {
          AND: [{ userId: ctx.session.user.id }, { reviewId: input.reviewId }],
        },
      });

      if (existingAssesment)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Already assessed this review",
        });

      try {
        const assesmentCreate = ctx.prisma.assesment.create({
          data: {
            ...input,
            reviewAnswers: {
              create: input.reviewAnswers.map(
                ({ answer, reviewQuestionId }) => ({
                  reviewQuestion: { connect: { id: reviewQuestionId } },
                  answer,
                })
              ),
            },
            user: { connect: { id: ctx.session.user.id } },
            reviewId: undefined, //used on connect, idk why I did this
            review: { connect: { id: input.reviewId } },
          },
          select: {
            id: true,
            user: { select: { profile: { select: { email: true } } } },
            review: {
              select: {
                // _count: {  select: {assesment: true} },
                assesment: {
                  where: { isDone: true },
                  select: { id: true },
                },
                history: {
                  select: {
                    id: true,
                    manuscript: { select: { title: true, id: true } },
                  },
                },
              },
            },
          },
        });

        const settingsGet = ctx.prisma.settings.findFirst();

        const [assessment, settings] = await ctx.prisma.$transaction([
          assesmentCreate,
          settingsGet,
        ]);

        const reviewersCount =
          settings?.reviewersCount ?? DEFAULT_REVIEWERS_COUNT;

        //TRIGGER ZONE
        //If all of the reviewers are done reviewing, change history status to reviewed
        if (assessment.review.assesment.length >= reviewersCount) {
          const historyUpdate = ctx.prisma.history.update({
            where: { id: assessment.review.history.id },
            data: { status: HISTORY_STATUS.reviewed },
            select: {
              updatedAt: true,
              status: true,
              manuscript: {
                select: {
                  id: true,
                  title: true,
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
          });

          const chiefEmailFetch = ctx.prisma.user.findMany({
            where: {
              OR: getRoleNumbers("chief").map((e) => ({
                role: e,
              })),
            },
            select: { profile: { select: { email: true } } },
          });

          const [chiefEmails, { manuscript }] = await ctx.prisma.$transaction([
            chiefEmailFetch,
            historyUpdate,
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
                  Subject: `Review for ${assessment.review.history.manuscript.title} is done`,
                  HTMLPart: `<h3>Dear Chief Editor,</h3>
                  <p>All of the reviewers has submitted their assesment on the submission titled <b>${
                    manuscript.title
                  }</b>  </p>
             <p>Please give a decision on the review by clicking the detail below</p>
              <p>Click the link below to open the details </p>
              <p><a href="${getBaseUrl()}/dashboard/chief/submissions/${
                    manuscript.id
                  }">Open</a></p>
              <p>Thank you.</p>`,
                },
              ],
            });
          } catch (e) {
            console.log(e);
          }
        }

        return {
          id: assessment.id,
          message: input.isDone
            ? "Assessment successfully submitted"
            : "Assessment draft saved",
        };
      } catch (e) {
        throw mutationError(e, "Review question ID is invalid");
      }
    }),
  getForChief: t.procedure
    .use(authGuard(["chief"]))
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const assesment = await ctx.prisma.assesment.findFirst({
        where: { AND: [{ id: input }, { isDone: true }] },
        select: {
          authorComment: true,
          editorComment: true,
          createdAt: true,
          decision: true,
          fileUrl: true,
          chiefFileUrl: true,
          reviewAnswers: {
            select: {
              answer: true,
              reviewQuestion: {
                select: {
                  maxScale: true,
                  question: true,
                },
              },
            },
          },
          user: { select: { id: true, profile: { select: { name: true } } } },
        },
      });

      if (!assesment)
        throw new TRPCError({ code: "NOT_FOUND", message: notFoundMessage });

      return assesment;
    }),
  getForReviewer: t.procedure
    .use(authGuard(["reviewer"]))
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const assesment = await ctx.prisma.assesment.findFirst({
        where: { AND: [{ id: input }, { isDone: true }] },
        select: {
          user: { select: { id: true } },
          authorComment: true,
          editorComment: true,
          createdAt: true,
          decision: true,
          chiefFileUrl: true,
          fileUrl: true,
          review: {
            select: {
              history: {
                select: {
                  manuscript: {
                    select: {
                      team: {
                        select: {
                          users: {
                            orderBy: { id: "asc" },
                            select: { id: true },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          reviewAnswers: {
            select: {
              answer: true,
              reviewQuestion: {
                select: {
                  maxScale: true,
                  question: true,
                },
              },
            },
          },
        },
      });

      if (!assesment)
        throw new TRPCError({ code: "NOT_FOUND", message: notFoundMessage });

      const mappedAssesment = {
        ...assesment,
        user: undefined,
        review: undefined,
        chiefFileUrl:
          ctx.session.user.id === assesment?.user.id
            ? assesment.chiefFileUrl
            : undefined,
        reviewerNumber:
          ctx.session.user.id === assesment?.user.id
            ? -1
            : (assesment?.review.history.manuscript.team?.users.findIndex(
                (e) => e.id === assesment.user.id
              ) ?? -1) + 1,
      };

      return mappedAssesment;
    }),
  getForSelfReviewer: t.procedure
    .use(authGuard(["reviewer"]))
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const assesment = await ctx.prisma.assesment.findFirst({
        where: {
          AND: [{ reviewId: input }, { userId: ctx.session.user.id }],
        },
        select: {
          id: true,
          authorComment: true,
          editorComment: true,
          decision: true,
          fileUrl: true,
          chiefFileUrl: true,
          isDone: true,
          reviewAnswers: {
            select: {
              answer: true,
              reviewQuestion: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      // if (!assesment)
      //   throw new TRPCError({ code: "NOT_FOUND", message: notFoundMessage });

      return assesment;
    }),
  getForAuthor: t.procedure
    .use(authGuard(["author"]))
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const assesment = await ctx.prisma.assesment.findFirst({
        where: {
          AND: [
            { id: input },
            { isDone: true },
            {
              review: {
                history: { manuscript: { authorId: ctx.session.user.id } },
              },
            },
          ],
        },
        select: {
          authorComment: true,
          createdAt: true,
          decision: true,
          fileUrl: true,
        },
      });

      if (!assesment)
        throw new TRPCError({ code: "NOT_FOUND", message: notFoundMessage });

      return assesment;
    }),
  update: t.procedure
    .use(authGuard(["reviewer"]))
    .input(updateAssessmentValidator)
    .mutation(async ({ ctx, input }) => {
      if (input.isDone && input.decision === REVIEW_DECISION.unanswered)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Decision required to submit",
        });

      try {
        await ctx.prisma.reviewAnswer.deleteMany({
          where: {
            assesmentId: input.id,
          },
        });

        const assessmentUpdate = ctx.prisma.assesment.update({
          where: { id: input.id },
          data: {
            ...input,
            reviewAnswers: {
              create: input.reviewAnswers.map(
                ({ answer, reviewQuestionId }) => ({
                  reviewQuestion: { connect: { id: reviewQuestionId } },
                  answer,
                })
              ),
            },
          },
          select: {
            id: true,
            user: { select: { profile: { select: { email: true } } } },
            review: {
              select: {
                assesment: {
                  where: { isDone: true },
                  select: { id: true },
                },
                history: {
                  select: {
                    id: true,
                    manuscript: { select: { title: true, id: true } },
                  },
                },
              },
            },
          },
        });

        const settingsGet = ctx.prisma.settings.findFirst();

        const [assessment, settings] = await ctx.prisma.$transaction([
          assessmentUpdate,
          settingsGet,
        ]);

        const reviewersCount =
          settings?.reviewersCount ?? DEFAULT_REVIEWERS_COUNT;

        //TRIGGER ZONE
        //If the reviewers are done reviewing, change history status to reviewed
        if (assessment.review.assesment.length >= reviewersCount) {
          const historyUpdate = ctx.prisma.history.update({
            where: { id: assessment.review.history.id },
            data: { status: HISTORY_STATUS.reviewed },
            select: {
              updatedAt: true,
              status: true,
              manuscript: {
                select: {
                  id: true,
                  title: true,
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
          });

          const chiefEmailFetch = ctx.prisma.user.findMany({
            where: {
              OR: getRoleNumbers("chief").map((e) => ({
                role: e,
              })),
            },
            select: { profile: { select: { email: true } } },
          });

          const [chiefEmails, { manuscript }] = await ctx.prisma.$transaction([
            chiefEmailFetch,
            historyUpdate,
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
                  Subject: `Review for ${assessment.review.history.manuscript.title} is done`,
                  HTMLPart: `<h3>Dear Chief Editor,</h3>
                  <p>All of the reviewers has submitted their assesment on the submission titled <b>${
                    manuscript.title
                  }</b>  </p>
             <p>Please give a decision on the review by clicking the detail below</p>
              <p>Click the link below to open the details </p>
              <p><a href="${getBaseUrl()}/dashboard/chief/submissions/${
                    manuscript.id
                  }">Open</a></p>
              <p>Thank you.</p>`,
                },
              ],
            });
          } catch (e) {
            console.log(e);
          }

          // await sendEmail({
          //   bcc: chiefEmails
          //       .filter((e) => e.profile !== null)
          //       .map((e) => e.profile!.email),
          //   subject: "Peer Review Done",
          //   html: `
          //   <h1>${history.manuscript.title}</h1>
          //
          //   <p>All of the reviewers has submitted their assesment on the submission with the title above</p>
          //   <p>Please give a decision on the review by clicking the detail below</p>
          //   <a href="${frontendOrigin}/dashboard/chief/submissions/${history.manuscript.id}">Submission detail</a>
          // `,
          // });

          // if (history.manuscript.team)
          //   await sendEmail({
          //     bcc: history.manuscript.team.users
          //         .filter((e) => e.profile !== null)
          //         .map((e) => e.profile!.email),
          //     subject: "Peer Review Done",
          //     html: `
          //   <h1>${history.manuscript.title}</h1>
          //
          //   <p>All of the reviewers has submitted their assesment on the assignment with the title above</p>
          //   <p>Click the link below to see all the assessments</p>
          //   <a href="${frontendOrigin}/dashboard/chief/submissions/${history.manuscript.id}">Submission detail</a>
          // `,
          //   });
        }

        return {
          id: assessment.id,
          message: input.isDone
            ? "Assessment successfully submitted"
            : "Assessment draft saved",
        };

        // if (req.body.isDone && assesment.user.profile) {
        //   await sendEmail({
        //     to: assesment.user.profile.email,
        //     subject: "Thank you for your review",
        //     html: `
        //   <h1>${assesment.review.history.manuscript.title}</h1>
        //
        //   <p>Thank you for submitting a review on the manuscript with the title above</p>
        //   <p>Click the link below for the detail</p>
        //   <a href="${frontendOrigin}/dashboard/reviewer/assignments/${assesment.review.history.manuscript.id}">Assignment detail</a>
        // `,
        //   });
        // }
      } catch (e) {
        throw mutationError(e, "Review question ID is invalid");
      }
    }),
});

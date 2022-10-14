import { t } from "../trpc";
import { authGuard } from "../authGuard";
import {
  questionValidators,
  updateQuestionValidators,
} from "../../validators/question";
import { questionListQuery } from "../../queries";
import { paginationMetadata, paginationQuery } from "../../utils/pagination";
import { getOrderQuery } from "../../utils/sortOrder";
import { questionListSorts } from "../../../utils/sorts";
import mutationError from "../../utils/mutationError";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

const notFoundMessage = "Review question not found";

export const questionRouter = t.router({
  create: t.procedure
    .use(authGuard(["admin"]))
    .input(questionValidators)
    .mutation(async ({ ctx, input }) => {
      const { id } = await ctx.prisma.reviewQuestion.create({
        data: {
          maxScale: input.maxScale,
          question: input.question,
        },
        select: {
          id: true,
        },
      });

      return `Question successfully created (ID:${id})`;
    }),
  get: t.procedure
    .use(authGuard(["admin"]))
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const question = await ctx.prisma.reviewQuestion.findUnique({
        where: { id: input },
        select: {
          id: true,
          maxScale: true,
          question: true,
          createdAt: true,
        },
      });

      if (!question)
        throw new TRPCError({ code: "NOT_FOUND", message: notFoundMessage });

      return question;
    }),
  list: t.procedure
    .use(authGuard(["admin", "reviewer"]))
    .input(questionListQuery)
    .query(async ({ ctx, input }) => {
      const getCount = ctx.prisma.reviewQuestion.count();
      const getQuestions = ctx.prisma.reviewQuestion.findMany({
        ...paginationQuery(input.page),
        orderBy: getOrderQuery({ ...input }, questionListSorts) ?? {
          createdAt: "desc",
        },
        select: {
          id: true,
          maxScale: true,
          question: true,
          createdAt: true,
        },
      });

      const [totalCount, questions] = await ctx.prisma.$transaction([
        getCount,
        getQuestions,
      ]);

      return {
        ...paginationMetadata(totalCount, input.page),
        questions,
      };
    }),
  update: t.procedure
    .use(authGuard(["admin"]))
    .input(updateQuestionValidators)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id } = await ctx.prisma.reviewQuestion.update({
          where: {
            id: input.id,
          },
          data: {
            maxScale: input.maxScale,
            question: input.question,
          },
          select: {
            id: true,
          },
        });

        return `Updated review question (ID:${id})`;
      } catch (e) {
        throw mutationError(e, notFoundMessage);
      }
    }),
  delete: t.procedure
    .use(authGuard(["admin"]))
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        const questionDelete = ctx.prisma.reviewQuestion.delete({
          where: {
            id: input,
          },
          select: {
            id: true,
          },
        });
        const answerDelete = ctx.prisma.reviewAnswer.deleteMany({
          where: {
            reviewQuestionId: input,
          },
        });

        const [{ id }] = await ctx.prisma.$transaction([
          questionDelete,
          answerDelete,
        ]);

        return `Question and answers deleted successfully (ID:${id})`;
      } catch (e) {
        throw mutationError(e, notFoundMessage);
      }
    }),
});

import { z } from "zod";

// rejected: -1,
// unanswered: 0,
// majorRevision: 1,
// minorRevision: 2,
// accepted: 3,
export const assesmentValidator = z.object({
  isDone: z.boolean(),
  authorComment: z.string(),
  editorComment: z.string(),
  fileUrl: z.string().url().nullish(),
  chiefFileUrl: z.string().url().nullish(),
  decision: z.number().gte(-1).lte(3),
  reviewAnswers: z.array(
    z.object({
      reviewQuestionId: z.string(),
      answer: z.number(),
    })
  ),
});

export const createAssesmentValidator = z
  .object({
    reviewId: z.string(),
  })
  .merge(assesmentValidator);
export const updateAssesmentValidator = z
  .object({
    id: z.string(),
  })
  .merge(assesmentValidator);

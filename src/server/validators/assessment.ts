import { z } from "zod";

// rejected: -1,
// unanswered: 0,
// majorRevision: 1,
// minorRevision: 2,
// accepted: 3,
export const assessmentValidator = z.object({
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

export const createAssessmentValidator = z
  .object({
    reviewId: z.string(),
  })
  .merge(assessmentValidator);
export const updateAssessmentValidator = z
  .object({
    id: z.string(),
  })
  .merge(assessmentValidator);

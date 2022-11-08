import { z } from "zod";
import { ASSESSMENT_DECISION } from "../../constants/numbers";

export const assessmentValidator = z.object({
  isDone: z.boolean(),
  authorComment: z.string(),
  editorComment: z.string(),
  fileUrl: z.string().url().nullish(),
  chiefFileUrl: z.string().url().nullish(),
  decision: z
    .number()
    .gte(ASSESSMENT_DECISION.rejected)
    .lte(ASSESSMENT_DECISION.accepted),
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

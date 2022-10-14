import { z } from "zod";

export const questionValidators = z.object({
  question: z.string(),
  maxScale: z.number(),
});

export const updateQuestionValidators = z
  .object({
    id: z.string(),
  })
  .merge(questionValidators);

import { z } from "zod";

export const questionValidator = z.object({
  question: z.string(),
  maxScale: z.number(),
});

export const updateQuestionValidator = z
  .object({
    id: z.string(),
  })
  .merge(questionValidator);

import { z } from "zod";

const reviewUpdateValidator = z.object({
  id: z.string(),
});

export const reviewUpdateDueValidator = z
  .object({
    dueDate: z.date(),
  })
  .merge(reviewUpdateValidator);

// rejected: -1,
// unanswered: 0,
// revision: 1,
// accepted: 2,
export const reviewUpdateDecisionValidator = z
  .object({
    decision: z.number().gte(-1).lte(2),
    comment: z.string().nullish(),
  })
  .merge(reviewUpdateValidator);

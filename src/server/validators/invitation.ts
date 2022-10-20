import { z } from "zod";
import { manuscriptIdValidator } from "./manuscript";

export const createInvitationValidator = z
  .object({
    reviewerId: z.string(),
  })
  .merge(manuscriptIdValidator);

export const updateInvitationValidator = z.object({
  status: z.boolean(),
  id: z.string(),
});

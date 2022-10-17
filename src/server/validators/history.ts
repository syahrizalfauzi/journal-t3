import { z } from "zod";

export const historyRejectValidator = z.object({
  manuscriptId: z.string(),
  reason: z.string(),
});
export const historyAcceptValidator = z.object({
  manuscriptId: z.string(),
  fileUrl: z.string(),
  isBlind: z.boolean(),
});
export const historyReviseValidator = z.object({
  manuscriptId: z.string(),
  fileUrl: z.string(),
});
export const historyProofreadValidator = z.object({
  manuscriptId: z.string(),
  fileUrl: z.string(),
});
export const historyFinalizeValidator = z.object({
  manuscriptId: z.string(),
  fileUrl: z.string().optional(),
});

export const historyManuscriptIdValidator = z.object({
  manuscriptId: z.string(),
});

import { z } from "zod";

export const rejectHistoryValidator = z.object({
  manuscriptId: z.string(),
  reason: z.string(),
});
export const acceptHistoryValidator = z.object({
  manuscriptId: z.string(),
  fileUrl: z.string(),
  isBlind: z.boolean(),
});
export const reviseHistoryValidator = z.object({
  manuscriptId: z.string(),
  fileUrl: z.string(),
});
export const proofreadHistoryValidator = z.object({
  manuscriptId: z.string(),
  fileUrl: z.string(),
});
export const finalizeHistoryValidator = z.object({
  manuscriptId: z.string(),
  fileUrl: z.string().optional(),
});

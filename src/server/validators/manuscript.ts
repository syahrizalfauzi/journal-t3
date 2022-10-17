import { z } from "zod";

export const manuscriptValidator = z.object({
  abstract: z.string(),
  authors: z.string(),
  title: z.string(),
  fileUrl: z.string().url(),
  coverFileUrl: z.string().url(),
  keywords: z.string().refine((keywords) => {
    if (!keywords) return true;

    const { length } = keywords
      .replace(/\s/g, "")
      .split(",")
      .filter((e) => e.length > 0);

    return length > 0;
  }, "must be at least one"),
});

export const updateManuscriptValidator = z
  .object({
    id: z.string(),
  })
  .merge(manuscriptValidator);

export const updateOptionalFileValidator = z.object({
  id: z.string(),
  optionalFileUrl: z.string().url(),
});

export const manuscriptIdValidator = z.object({
  manuscriptId: z.string(),
});

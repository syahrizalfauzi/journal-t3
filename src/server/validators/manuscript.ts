import { z } from "zod";

export const manuscriptValidators = z.object({
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

export const updateManuscriptValidators = z
  .object({
    id: z.string(),
  })
  .merge(manuscriptValidators);

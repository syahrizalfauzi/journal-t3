import { z } from "zod";

export const pageValidator = z.object({
  data: z.string(),
});

export const updatePageValidator = z
  .object({
    id: z.string(),
  })
  .merge(pageValidator);

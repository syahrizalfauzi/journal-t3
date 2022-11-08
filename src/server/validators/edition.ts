import { z } from "zod";

export const editionValidator = z.object({
  name: z.string(),
  doi: z.string(),
  isAvailable: z.boolean(),
});

export const updateEditionValidator = z
  .object({
    id: z.string(),
  })
  .merge(editionValidator);

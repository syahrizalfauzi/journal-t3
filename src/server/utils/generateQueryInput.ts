import { z } from "zod";

const generateQueryInput = (allowedSorts: readonly [string, ...string[]]) =>
  z.object({
    order: z.enum(["asc", "desc"]).optional(),
    sort: z.enum(allowedSorts),
    filter: z
      .object({
        isActivated: z.boolean().optional(),
      })
      .optional(),
    page: z.number().optional(),
  });

export default generateQueryInput;

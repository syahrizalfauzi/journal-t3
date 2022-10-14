import { z } from "zod";
import { Sorts } from "../../types/SortOrder";

const generateQueryInput = (allowedSorts: readonly Sorts[]) =>
  z.object({
    order: z.enum(["asc", "desc"]).optional(),
    sort: z.enum(allowedSorts as readonly [string, ...string[]]),
    filter: z
      .object({
        isActivated: z.boolean().optional(),
      })
      .optional(),
    page: z.number().optional(),
  });

export default generateQueryInput;

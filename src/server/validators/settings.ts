import { z } from "zod";

export const settingsValidator = z.object({
  maxArticlesPerLatestEdition: z.number().min(1),
  reviewersCount: z.number().min(1),
  maintenanceMode: z.boolean(),
});

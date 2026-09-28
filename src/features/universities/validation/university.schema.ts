import { z } from "zod";

export const universityFiltersSchema = z.object({
  query: z.string().trim().min(1).optional(),
  city: z.string().trim().min(1).optional(),
});

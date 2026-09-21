import { z } from "zod";

export const universityFiltersSchema = z.object({
  query: z.string().optional(),
  city: z.string().optional(),
});

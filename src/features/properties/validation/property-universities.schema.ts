import { z } from "zod";

// Optional in the Create Property flow; the existing model has no minimum.
export const propertyUniversitiesSchema = z.object({
  university_ids: z.array(z.uuid()).refine(
    (ids) => new Set(ids).size === ids.length,
    "Select each university only once.",
  ),
});

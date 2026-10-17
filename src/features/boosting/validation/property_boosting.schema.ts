import { z } from "zod";

export const propertyBoostingSchema = z
  .object({
    property_id: z.uuid(),
    boosting_plan_id: z.uuid(),
  })
  .strict();

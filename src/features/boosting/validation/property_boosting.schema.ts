import { z } from "zod";

export const propertyBoostingSchema = z.object({
  property_id: z.uuid(),
  boosting_plan_id: z.uuid(),
  is_paid: z.boolean(),
  start_date: z.iso.datetime(),
  end_date: z.iso.datetime(),
  status: z.enum(["active", "expired"]),
});


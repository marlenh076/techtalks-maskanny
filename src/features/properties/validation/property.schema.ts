import { z } from "zod";

export const propertySchema = z.object({
  host_id: z.string().uuid(),

  property_type: z.enum(["dorm", "studio", "apartment"]),

  title: z.string().min(1, "Title is required"),

  description: z.string().nullable(),

  address: z.string().min(1, "Address is required"),

  latitude: z.number(),

  longitude: z.number(),

  price: z.number().positive(),

  bedrooms: z.number().int().nonnegative(),

  bathrooms: z.number().int().nonnegative(),

  bed_count: z.number().int().nonnegative(),

  furnished: z.boolean(),

  electricity_included: z.boolean(),

  kitchen_type: z.enum(["private", "shared"]),

  bathroom_type: z.enum(["private", "shared"]),

  gender: z.enum(["boys", "girls", "mixed"]),
});

export const propertyFiltersSchema = z.object({
  query: z.string().optional(),

  property_type: z.enum(["dorm", "studio", "apartment"]).optional(),

  min_price: z.coerce.number().nonnegative().optional(),

  max_price: z.coerce.number().nonnegative().optional(),

  bedrooms: z.coerce.number().int().nonnegative().optional(),

  bathrooms: z.coerce.number().int().nonnegative().optional(),

  furnished: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),

  electricity_included: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),

  gender: z.enum(["boys", "girls", "mixed"]).optional(),
});

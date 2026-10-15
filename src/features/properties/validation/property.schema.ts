import { z } from "zod";

export const propertySchema = z.object({
  property_type: z.enum(["dorm", "studio", "apartment"]),

  title: z.string().trim().min(1, "Title is required"),

  description: z.string().nullable(),

  address: z.string().trim().min(1, "Address is required"),

  latitude: z.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90"),

  longitude: z.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180"),

  price: z.number().positive("Monthly price must be greater than zero"),

  bedrooms: z.number().int("Bedrooms must be a whole number").nonnegative("Bedrooms cannot be negative"),

  bathrooms: z.number().int("Bathrooms must be a whole number").nonnegative("Bathrooms cannot be negative"),

  bed_count: z.number().int("Beds must be a whole number").nonnegative("Beds cannot be negative"),

  furnished: z.boolean(),

  electricity_included: z.boolean(),

  kitchen_type: z.enum(["private", "shared"]),

  bathroom_type: z.enum(["private", "shared"]),

  gender: z.enum(["boys", "girls", "mixed"]),
});

export const propertyFiltersSchema = z.object({
  university_id: z.uuid().optional(),

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

export const propertyUpdateSchema = propertySchema.partial();

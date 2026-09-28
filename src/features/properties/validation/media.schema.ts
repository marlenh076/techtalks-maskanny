import { z } from "zod";

export const mediaSchema = z.object({
  url: z.url(),
  type: z.enum(["image", "video"]),
});

export const mediaUpdateSchema = mediaSchema.partial();

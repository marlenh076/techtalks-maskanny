import { z } from "zod";
import { lebanesePhoneSchema } from "./user.schema";

export const hostProfileSettingsSchema = z
  .object({
    firstname: z.string().trim().min(1).max(100),
    lastname: z.string().trim().min(1).max(100),
    phone: lebanesePhoneSchema,
  })
  .strict();

export const hostPasswordSettingsSchema = z
  .object({
    currentPassword: z.string().min(1).max(128),
    newPassword: z.string().min(8).max(128),
    confirmPassword: z.string().min(1).max(128),
  })
  .strict()
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password confirmation does not match",
  })
  .refine((value) => value.newPassword !== value.currentPassword, {
    path: ["newPassword"],
    message: "Choose a password different from your current password",
  });

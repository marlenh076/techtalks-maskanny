import { z } from "zod";

export const lebanesePhoneSchema = z
  .string()
  .regex(
    /^(01|03|05|70|71|76|78|79|81)\d{6}$/,
    "Invalid Lebanese phone number",
  );

export const userCreateSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email"),
  phone: lebanesePhoneSchema,
});

export const userUpdateSchema = userCreateSchema
  .omit({ email: true })
  .partial()
  .strict();

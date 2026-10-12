import { z } from "zod";

export const uuidSchema = z.uuid();
export const reasonSchema = z.string().trim().min(1).max(1000);
export const approvalSchema = z
  .object({ reason: reasonSchema.optional() })
  .strict();
export const rejectionSchema = z.object({ reason: reasonSchema }).strict();
const date = z.iso.datetime({ offset: true });
const pagination = {
  page: z.coerce.number().int().min(1).max(1000000).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(25),
  query: z.string().trim().max(200).optional(),
  from: date.optional(),
  to: date.optional(),
  sort: z.enum(["created_at", "name", "price"]).default("created_at"),
  direction: z.enum(["asc", "desc"]).default("desc"),
};
const validRange = (v: { from?: string; to?: string }) =>
  !v.from || !v.to || Date.parse(v.from) < Date.parse(v.to);
export const propertyListSchema = z
  .object({
    ...pagination,
    status: z
      .enum(["pending", "approved", "active", "rejected", "all"])
      .default("pending"),
    property_type: z.enum(["dorm", "studio", "apartment"]).optional(),
    host_id: uuidSchema.optional(),
  })
  .strict()
  .refine(validRange, "from must precede to");
export const directoryListSchema = z.object({
  page: pagination.page,
  page_size: pagination.page_size,
  query: pagination.query,
  from: date.optional(),
  to: date.optional(),
  role: z.enum(["user", "admin"]).optional(),
  sort: z.enum(["created_at", "name"]).default("created_at"),
  direction: pagination.direction,
}).strict().refine(validRange, "from must precede to");
export const boostQueueSchema = z.object({
  page: pagination.page,
  page_size: pagination.page_size,
  query: pagination.query,
  from: date.optional(),
  to: date.optional(),
  payment_status: z.enum(["not_submitted", "legacy_unrecorded", "pending", "verified", "rejected"]).optional(),
  boost_status: z.enum(["pending", "active", "expired", "rejected"]).optional(),
}).strict().refine(validRange, "from must precede to");
export const rangeSchema = z
  .object({ from: date, to: date })
  .strict()
  .refine(
    (v) =>
      validRange(v) && Date.parse(v.to) - Date.parse(v.from) <= 366 * 86400000,
    "Range must be positive and at most 366 days",
  );
export const reportSchema = z
  .object({
    from: date,
    to: date,
    type: z.enum(["overview", "users", "listings"]),
    format: z.enum(["json", "csv"]).default("json"),
  })
  .strict()
  .refine(
    (v) =>
      validRange(v) && Date.parse(v.to) - Date.parse(v.from) <= 366 * 86400000,
    "Range must be positive and at most 366 days",
  );
export const propertyEditSchema = z
  .object({
    reason: reasonSchema,
    changes: z
      .object({
        title: z.string().trim().min(1).max(200).optional(),
        price: z.number().positive().lt(1000000000).optional(),
        property_type: z.enum(["dorm", "studio", "apartment"]).optional(),
      })
      .strict()
      .refine((v) => Object.keys(v).length > 0, "At least one change required"),
  })
  .strict();
export const profileSchema = z.union([
  z
    .object({
      firstname: z.string().trim().min(1).max(100).optional(),
      lastname: z.string().trim().min(1).max(100).optional(),
    })
    .strict()
    .refine((v) => Object.keys(v).length > 0, "At least one change required"),
  // Auth and profile writes are separate operations, never a partially applied combined save.
  z.object({ email: z.email().trim().max(254) }).strict(),
]);
export const passwordSchema = z
  .object({
    current_password: z.string().min(1).max(1024),
    new_password: z.string().min(8).max(128),
    nonce: z.string().min(1).max(100).optional(),
  })
  .strict()
  .refine(
    (v) => v.current_password !== v.new_password,
    "Choose a different password",
  );

export function queryObject(url: string) {
  const params = new URL(url).searchParams;
  const values: Record<string, string> = {};
  for (const [key, value] of params) {
    if (key in values) throw new Error("Duplicate query parameter");
    values[key] = value;
  }
  return values;
}

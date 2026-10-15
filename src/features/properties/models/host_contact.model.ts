import { z } from "zod";

// This allowlist is shared by the endpoint and its consumer. Account email and
// identifiers are deliberately excluded from the listing's public contact data.
export const hostContactSchema = z.object({
  firstname: z.string().nullable(),
  lastname: z.string().nullable(),
  phone: z.string().nullable(),
});

export type HostContact = z.infer<typeof hostContactSchema>;

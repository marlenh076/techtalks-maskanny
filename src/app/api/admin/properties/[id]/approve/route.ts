import {
  authorized,
  body,
  json,
  type IdContext,
} from "@/src/features/admin/http";
import {
  approvalSchema,
  uuidSchema,
} from "@/src/features/admin/validation/admin.schema";
import { PropertyModerationRepository } from "@/src/features/properties/repository/property_moderation.repository";
import { PropertyModerationService } from "@/src/features/properties/service/property_moderation";
import { getAccessToken } from "@/src/lib/supabase/auth";

export async function POST(request: Request, context: IdContext) {
  return authorized(request, async () => {
    const id = uuidSchema.parse((await context.params).id);
    const { reason } = await body(request, approvalSchema, true);
    await new PropertyModerationService(
      new PropertyModerationRepository(getAccessToken(request)!),
    ).approve(id, reason);
    return json({ message: "Property approved" });
  });
}

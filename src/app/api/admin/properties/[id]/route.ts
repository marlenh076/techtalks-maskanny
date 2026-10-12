import { authorized, body, json, type IdContext } from "@/src/features/admin/http";
import { propertyEditSchema, uuidSchema } from "@/src/features/admin/validation/admin.schema";
import { PropertyModerationReadRepository } from "@/src/features/properties/repository/property_moderation_read.repository";
import { PropertyModerationReadService } from "@/src/features/properties/service/property_moderation_read";
import { getAccessToken } from "@/src/lib/supabase/auth";

export async function GET(request: Request, context: IdContext) {
  return authorized(request, async () => {
    const id = uuidSchema.parse((await context.params).id);
    const item = await new PropertyModerationReadService(new PropertyModerationReadRepository(getAccessToken(request)!)).getById(id);
    return item ? json(item) : json({ error: "Property not found" }, 404);
  });
}
export async function PATCH(request: Request, context: IdContext) {
  return authorized(request, async repo => {
    const id = uuidSchema.parse((await context.params).id);
    const { changes, reason } = await body(request, propertyEditSchema);
    return json(await repo.rpc("admin_edit_property", { p_property_id: id, p_changes: changes, p_reason: reason }));
  });
}

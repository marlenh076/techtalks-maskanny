import { authorized, json, query } from "@/src/features/admin/http";
import { propertyListSchema } from "@/src/features/admin/validation/admin.schema";
import type { ModerationPropertySummary } from "@/src/features/properties/models/property_moderation.model";

export async function GET(request: Request) {
  return authorized(request, async (repo) => {
    const filters = query(request, propertyListSchema);
    const page = await repo.list<ModerationPropertySummary>("properties", {
      ...filters,
      status: filters.status === "all" ? undefined : filters.status,
    });
    // Keep the established array response; pagination is exposed in headers.
    return json(page.items, 200, {
      "X-Total-Count": String(page.total),
      "X-Page": String(page.page),
      "X-Page-Size": String(page.page_size),
    });
  });
}

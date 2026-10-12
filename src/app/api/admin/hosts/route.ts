import { authorized, json, query } from "@/src/features/admin/http";
import { directoryListSchema } from "@/src/features/admin/validation/admin.schema";
import { AdminError } from "@/src/features/admin/service/errors";

export async function GET(request: Request) {
  return authorized(request, async repo => {
    const filters = query(request, directoryListSchema);
    if (filters.role) throw new AdminError("Role filtering applies to users only", 400);
    return json(await repo.directory("hosts", filters));
  });
}

import { authorized, json, query } from "@/src/features/admin/http";
import { rangeSchema } from "@/src/features/admin/validation/admin.schema";
import { AdminService } from "@/src/features/admin/service/admin";
export async function GET(request: Request) {
  return authorized(request, async (repo) => {
    const { from, to } = query(request, rangeSchema);
    return json(await new AdminService(repo).statistics(from, to));
  });
}

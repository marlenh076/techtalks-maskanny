import { authorized, json, query } from "@/src/features/admin/http";
import { directoryListSchema } from "@/src/features/admin/validation/admin.schema";

export async function GET(request: Request) {
  return authorized(request, async repo =>
    json(await repo.directory("users", query(request, directoryListSchema))));
}

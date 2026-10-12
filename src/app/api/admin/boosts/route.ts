import { authorized, json, query } from "@/src/features/admin/http";
import { boostQueueSchema } from "@/src/features/admin/validation/admin.schema";

export async function GET(request: Request) {
  return authorized(request, async repo =>
    json(await repo.boostQueue(query(request, boostQueueSchema))));
}

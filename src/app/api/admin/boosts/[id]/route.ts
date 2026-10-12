import { authorized, json, type IdContext } from "@/src/features/admin/http";
import { uuidSchema } from "@/src/features/admin/validation/admin.schema";
import { AdminError } from "@/src/features/admin/service/errors";

export async function GET(request: Request, context: IdContext) {
  return authorized(request, async repo => {
    const id = uuidSchema.parse((await context.params).id);
    const detail = await repo.boostDetail(id);
    if (!detail) throw new AdminError("Boost request not found", 404);
    return json(detail);
  });
}

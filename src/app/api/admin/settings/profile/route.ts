import { authorized, body, json } from "@/src/features/admin/http";
import { profileSchema } from "@/src/features/admin/validation/admin.schema";
import { AdminService } from "@/src/features/admin/service/admin";
import { changeEmail } from "@/src/features/admin/service/settings";
import { getAccessToken } from "@/src/lib/supabase/auth";
export async function GET(request: Request) {
  return authorized(request, async (repo) => json(await new AdminService(repo).profile()));
}
export async function PATCH(request: Request) {
  return authorized(request, async (repo, userId) => {
    const changes = await body(request, profileSchema);
    if ("email" in changes)
      return json(await changeEmail(userId, getAccessToken(request)!, changes.email));
    return json(await repo.updateProfile(changes));
  });
}

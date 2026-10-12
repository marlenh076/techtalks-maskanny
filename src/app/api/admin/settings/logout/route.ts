import { authorized, json } from "@/src/features/admin/http";
import { getAccessToken } from "@/src/lib/supabase/auth";
import { AdminError } from "@/src/features/admin/service/errors";
export async function POST(request: Request) {
  return authorized(request, async (repo) => {
    const { error } = await repo.client.auth.admin.signOut(
      getAccessToken(request)!,
      "local",
    );
    if (error) throw new AdminError("Auth could not revoke the session", 502);
    return json({ message: "Session revoked; clear local session tokens" });
  });
}

import { authorized, body, json } from "@/src/features/admin/http";
import { passwordSchema } from "@/src/features/admin/validation/admin.schema";
import { changePassword } from "@/src/features/admin/service/settings";
export async function POST(request: Request) {
  return authorized(request, async (repo, userId) => {
    const input = await body(request, passwordSchema);
    const profile = await repo.profile();
    await changePassword(
      userId,
      profile.email,
      input.current_password,
      input.new_password,
      input.nonce,
    );
    return json({ message: "Password updated" });
  });
}

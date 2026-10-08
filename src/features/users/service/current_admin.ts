import { getAccessToken, getCurrentUser } from "@/src/lib/supabase/auth";
import { UserRepository } from "../repository/user.repository";

type CurrentAdminResult =
  | { authorized: true; userId: string }
  | { authorized: false; status: 401 | 403 };

export async function getCurrentAdmin(
  request: Request,
): Promise<CurrentAdminResult> {
  const token = getAccessToken(request);

  if (!token) {
    return { authorized: false, status: 401 };
  }

  const authUser = await getCurrentUser(request);

  if (!authUser) {
    return { authorized: false, status: 401 };
  }

  const profile = await new UserRepository(token).getById(authUser.id);

  if (profile?.role !== "admin") {
    return { authorized: false, status: 403 };
  }

  return { authorized: true, userId: authUser.id };
}

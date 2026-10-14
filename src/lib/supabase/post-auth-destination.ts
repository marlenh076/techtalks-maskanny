import { supabase } from "./client";
import { safeReturnPath } from "./safe-return";

export async function postAuthDestination(userId: string, requestedPath: string | null = null) {
  const safePath = safeReturnPath(requestedPath);
  if (safePath) return safePath;

  const { data: profile } = await supabase
    .from("user")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  return profile?.role === "admin" ? "/admin" : "/host/onboarding";
}

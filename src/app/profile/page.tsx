import { redirect } from "next/navigation";
import { createCookieClient } from "@/src/lib/supabase/cookie-client";
import { ProfilePage } from "@/src/features/users/presentation/ProfilePage";

export const dynamic = "force-dynamic";

export default async function ProfileRoute() {
  const supabase = await createCookieClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) redirect("/sign-in?next=%2Fprofile");
  return <ProfilePage />;
}

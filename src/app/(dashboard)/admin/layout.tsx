import { notFound, redirect } from "next/navigation";
import { createCookieClient } from "@/src/lib/supabase/cookie-client";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createCookieClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/sign-in?next=%2Fadmin");

  const { data: profile, error: profileError } = await supabase
    .from("user")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") notFound();
  return children;
}

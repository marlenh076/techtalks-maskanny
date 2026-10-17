import { redirect } from "next/navigation";
import { createCookieClient } from "@/src/lib/supabase/cookie-client";

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createCookieClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  const { data: host, error } = await supabase
    .from("host")
    .select("host_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !host) {
    redirect("/");
  }
  return children;
}

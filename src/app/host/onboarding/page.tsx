import { redirect } from "next/navigation";
import { createCookieClient } from "@/src/lib/supabase/cookie-client";
import { HostOnboardingWelcome } from "./host-onboarding-welcome";

export const dynamic = "force-dynamic";

export default async function HostOnboardingPage() {
  const supabase = await createCookieClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/sign-in?next=%2Fhost%2Fonboarding");

  const { data: host, error: hostError } = await supabase
    .from("host")
    .select("host_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (host && !hostError) redirect("/properties/create");
  return <HostOnboardingWelcome accessError={!!hostError} />;
}

import { redirect } from "next/navigation";
import { createCookieClient } from "@/src/lib/supabase/cookie-client";
import { VerifyEmailForm } from "./verify-email-form";

export const dynamic = "force-dynamic";

export default async function VerifyEmailPage() {
  const supabase = await createCookieClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!error && user?.email_confirmed_at) {
    const { data: profile } = await supabase
      .from("user")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
    redirect(profile?.role === "admin" ? "/admin" : "/host/onboarding");
  }

  return <VerifyEmailForm />;
}

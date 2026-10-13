import { redirect } from "next/navigation";
import { createCookieClient } from "@/src/lib/supabase/cookie-client";
import { HostOnboardingButton } from "./host-onboarding-button";
import { AuthenticatedHeader } from "@/src/components/auth/AuthenticatedHeader";

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
  if (host) redirect("/properties/create");

  return (
    <main className="flex min-h-screen flex-col bg-[var(--bg)] px-4 py-6 text-[var(--ink)] sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <AuthenticatedHeader email={user.email} />
      </div>
      <section className="mx-auto my-auto w-full max-w-xl rounded-[var(--radius-lg)] border border-[var(--line-strong)] bg-[var(--surface)] p-7 shadow-sm sm:p-10">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-2)]">Maskanny hosting</span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Become a Host</h1>
        {hostError ? (
          <p role="alert" className="mt-6 rounded-[var(--radius-sm)] bg-[var(--danger-bg)] p-4 text-sm text-[var(--danger)]">We couldn&apos;t check your Host access. Refresh and try again.</p>
        ) : (
          <>
            <p className="mt-4 text-sm leading-7 text-[var(--soft)]">Set up your Host account to list a property for students. We&apos;ll take you to the property form after you confirm.</p>
            <HostOnboardingButton />
          </>
        )}
      </section>
    </main>
  );
}

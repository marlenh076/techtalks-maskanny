"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { supabase } from "@/src/lib/supabase/client";
import { recoveryRedirectUrl } from "@/src/lib/supabase/recovery-flow";
import { AuthButton, AuthField, AuthHeading, AuthNotice } from "../auth-ui";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    try {
      // A newly created Supabase client may still be clearing an invalid old
      // session. That cleanup removes PKCE verifiers, including one created by
      // a concurrent first recovery request. Finish initialization first.
      const { error: initializationError } = await supabase.auth.initialize();
      if (initializationError) {
        setError("We couldn't prepare a reset link. Please try again.");
        return;
      }
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        // Keep recovery identifiable even when Supabase cannot exchange an
        // expired code or find the PKCE verifier. The callback still requires
        // Supabase's verified recovery result before allowing a reset.
        redirectTo: recoveryRedirectUrl(window.location.origin),
      });
      if (resetError) {
        setError(resetError.status === 429 ? "Too many requests. Please wait and try again." : "We couldn't send a reset link. Please try again later.");
        return;
      }
      setSent(true);
    } catch {
      setError("We couldn't send the link. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AuthHeading title="Forgot your password?" description="Enter your email to request a reset link." />
      {sent ? (
        <AuthNotice success message="If an account exists for that email, you'll receive a reset link. Check your inbox and spam folder." />
      ) : (
        <form method="post" onSubmit={handleSubmit} className="space-y-5">
          <AuthField id="email" name="email" label="Email address" type="email" autoComplete="email" placeholder="you@example.com" required />
          <AuthNotice message={error} />
          <AuthButton loading={loading}>{loading ? "Sending link…" : "Send reset link"}</AuthButton>
        </form>
      )}
      <p className="mt-7 text-center text-sm text-[var(--soft)]"><Link href="/sign-in" className="font-semibold text-[var(--ink)] underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--ink)]">Back to sign in</Link></p>
    </>
  );
}

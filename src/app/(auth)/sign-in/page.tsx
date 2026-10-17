"use client";

import Link from "next/link";
import { use, useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/src/lib/supabase/client";
import { postAuthDestination } from "@/src/lib/supabase/post-auth-destination";
import { safeReturnPath } from "@/src/lib/supabase/safe-return";
import { AuthButton, AuthField, AuthHeading, AuthNotice } from "../auth-ui";

export default function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = use(searchParams);
  const next = safeReturnPath(typeof params.next === "string" ? params.next : null);
  const signupHref = next ? `/sign-up?next=${encodeURIComponent(next)}` : "/sign-up";
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void supabase.auth
      .getUser()
      .then(async ({ data, error: userError }) => {
        if (!active) return;
        if (!userError && data.user) {
          const destination = await postAuthDestination(data.user.id, next).catch(
            () => next ?? "/host/onboarding",
          );
          if (active) window.location.replace(destination);
          return;
        }
        setCheckingSession(false);
      })
      .catch(() => {
        if (active) setCheckingSession(false);
      });
    return () => {
      active = false;
    };
  }, [next]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || checkingSession) return;
    setLoading(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    try {
      const { data: result, error: signInError } = await supabase.auth.signInWithPassword({
        email: String(data.get("email") ?? "").trim(),
        password: String(data.get("password") ?? ""),
      });
      if (signInError) {
        setError(
          signInError.code === "email_not_confirmed"
            ? "Please confirm your email before signing in."
            : signInError.code === "invalid_credentials"
              ? "Email or password is incorrect."
              : signInError.status === 429
                ? "Too many attempts. Please wait and try again."
                : "We couldn't sign you in. Please try again.",
        );
        return;
      }
      sessionStorage.removeItem("maskanny-recovery");
      const destination = await postAuthDestination(result.user.id, next);
      window.location.replace(destination);
    } catch {
      setError("We couldn't sign you in. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AuthHeading title="Welcome back" description="Sign in to continue your housing search." />
      {checkingSession ? (
        <p role="status" className="text-sm text-[var(--soft)]">
          Checking your session…
        </p>
      ) : (
        <form method="post" onSubmit={handleSubmit} className="space-y-5">
          <AuthField
            id="email"
            name="email"
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
          <div>
            <AuthField
              id="password"
              name="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              required
            />
            <div className="mt-3 text-right">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-[var(--ink-2)] underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--ink)]"
              >
                Forgot password?
              </Link>
            </div>
          </div>
          <AuthNotice message={error} />
          <AuthButton loading={loading}>{loading ? "Signing in…" : "Sign in"}</AuthButton>
        </form>
      )}
      {!checkingSession && (
        <p className="mt-6 text-center text-sm text-[var(--soft)]">
          New to Maskanny?{" "}
          <Link
            href={signupHref}
            className="auth-switch-link font-semibold underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--ink)]"
          >
            Create an account
          </Link>
        </p>
      )}
    </>
  );
}

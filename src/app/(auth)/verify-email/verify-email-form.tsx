"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { supabase } from "@/src/lib/supabase/client";
import {
  clearPendingVerification,
  readPendingVerification,
  startResendCooldown,
  type PendingVerification,
} from "@/src/lib/supabase/pending-verification";
import { postAuthDestination } from "@/src/lib/supabase/post-auth-destination";
import { AuthActionLink, AuthHeading, AuthNotice } from "../auth-ui";

const subscribeToHydration = () => () => {};

export function VerifyEmailForm() {
  const hydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const [pending, setPending] = useState<PendingVerification | null>(() => typeof window === "undefined" ? null : readPendingVerification());
  const [resending, setResending] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const resendInFlight = useRef(false);

  useEffect(() => {
    let active = true;
    let checking = false;

    async function checkConfirmedSession() {
      if (checking || document.visibilityState === "hidden") return;
      checking = true;
      let timeoutId: number | undefined;
      try {
        const result = await Promise.race([
          supabase.auth.getUser(),
          new Promise<null>((resolve) => { timeoutId = window.setTimeout(() => resolve(null), 8_000); }),
        ]);
        if (!active || !result || result.error || !result.data.user?.email_confirmed_at) return;
        const user = result.data.user;
        const saved = readPendingVerification();
        const requestedPath = saved && saved.email.toLowerCase() === user.email?.toLowerCase() ? saved.next : null;
        const destination = await postAuthDestination(user.id, requestedPath).catch(() => "/host/onboarding");
        if (active) {
          clearPendingVerification();
          window.location.replace(destination);
        }
      } catch {
        // Sign In remains available even when the session check cannot complete.
      } finally {
        window.clearTimeout(timeoutId);
        checking = false;
      }
    }

    const checkWhenVisible = () => {
      if (document.visibilityState === "visible") void checkConfirmedSession();
    };
    void checkConfirmedSession();
    window.addEventListener("focus", checkWhenVisible);
    document.addEventListener("visibilitychange", checkWhenVisible);
    return () => {
      active = false;
      window.removeEventListener("focus", checkWhenVisible);
      document.removeEventListener("visibilitychange", checkWhenVisible);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const secondsLeft = pending ? Math.max(0, Math.ceil((pending.resendAfter - now) / 1000)) : 0;
  const signInHref = pending?.next ? `/sign-in?next=${encodeURIComponent(pending.next)}` : "/sign-in";

  async function handleResend() {
    if (!pending || resendInFlight.current || secondsLeft > 0) return;
    resendInFlight.current = true;
    setResending(true);
    setError(null);
    setNotice(null);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: pending.email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (resendError) {
        if (resendError.status === 429) {
          setPending(startResendCooldown(pending));
          setError("Too many requests. Please wait before resending.");
        } else {
          setError("We couldn't resend the email. Please try again later.");
        }
        return;
      }
      setPending(startResendCooldown(pending));
      setNotice("If this address needs confirmation, check your inbox for a new link.");
    } catch {
      setError("We couldn't resend the email. Check your connection and try again.");
    } finally {
      resendInFlight.current = false;
      setResending(false);
    }
  }

  return (
    <>
      <AuthHeading title="Check your email" description={hydrated && !pending ? "If you signed up recently, look for a confirmation link." : "If this address can be registered, look for a confirmation link."} />
      {!hydrated ? (
        <p role="status" className="text-sm text-[var(--soft)]">Loading your details…</p>
      ) : !pending ? (
        <div className="space-y-4">
          <p className="text-sm leading-6 text-[var(--soft)]">We don&apos;t have your signup email here, so resend isn&apos;t available.</p>
          <AuthActionLink href="/sign-in">Go to sign in</AuthActionLink>
          <Link href="/sign-up" className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--ink-2)] underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--ink)]">Back to sign up</Link>
        </div>
      ) : (
        <>
          <p className="-mt-1 mb-4 break-all text-sm text-[var(--soft)]">Signup email: <span className="font-semibold text-[var(--ink)]">{pending.email}</span></p>
          <p className="mb-5 text-sm leading-6 text-[var(--soft)]">Open the link to confirm your email, then sign in.</p>
          <AuthNotice message={error} />
          <AuthNotice success message={notice} />
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-[var(--line)] pt-4 text-sm">
            <button type="button" onClick={() => void handleResend()} disabled={resending || secondsLeft > 0} className="min-h-11 font-semibold text-[var(--ink)] underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-60">
              {resending ? "Sending…" : secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend link"}
            </button>
            <Link href={signInHref} className="inline-flex min-h-11 items-center font-semibold text-[var(--ink)] underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--ink)]">Sign in</Link>
            <Link href="/sign-up" onClick={clearPendingVerification} className="inline-flex min-h-11 items-center font-medium text-[var(--ink-2)] underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--ink)]">Change email</Link>
          </div>
        </>
      )}
    </>
  );
}

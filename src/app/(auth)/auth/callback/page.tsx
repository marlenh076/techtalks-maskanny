"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/src/lib/supabase/client";
import { createConfirmationClient, createPkceConfirmationClient } from "@/src/lib/supabase/confirmation-client";
import { clearPendingVerification, readPendingVerification, type PendingVerification } from "@/src/lib/supabase/pending-verification";
import { exchangedCodePurpose, hasRecoveryHint } from "@/src/lib/supabase/recovery-flow";
import { AuthActionLink, AuthHeading, AuthNotice } from "../../auth-ui";

const LINK_ERROR = "Maskanny couldn't confirm your verification status from this link. It may be invalid, expired, or already used. If your email was confirmed, continue to Sign In.";
const RECOVERY_LINK_ERROR = "This reset link may be invalid, expired, or already used.";

class CallbackFlowError extends Error {
  constructor(message: string, readonly recovery = false) {
    super(message);
  }
}

type CallbackResult = { kind: "verified" } | { kind: "recovery"; destination: "/reset-password" };

async function completeLink(): Promise<CallbackResult> {
  const url = new URL(window.location.href);
  const hash = new URLSearchParams(url.hash.slice(1));
  const flowId = url.searchParams.get("sb_flow_id");
  // Keep the flow id in memory for the PKCE exchange, then remove all link
  // credentials from the address bar before making any network request.
  window.history.replaceState(window.history.state, "", url.pathname);
  // The redirect marker only selects recovery-specific failure UX. It is not
  // proof of a recovery session; Supabase must verify the link below.
  const recoveryHint = hasRecoveryHint(url);
  let recovery = false;
  let confirmed = false;
  let recoverySession: { access_token: string; refresh_token: string } | null = null;

  if (url.searchParams.has("error") || hash.has("error")) throw new CallbackFlowError(recoveryHint ? RECOVERY_LINK_ERROR : LINK_ERROR, recoveryHint);

  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  if (code) {
    // A separate client exchanges the PKCE code without writing the returned
    // session into Maskanny's shared browser cookies.
    const confirmation = createPkceConfirmationClient();
    const { data: { subscription } } = confirmation.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") recovery = true;
    });
    const { data, error } = await confirmation.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined).finally(() => subscription.unsubscribe());
    if (error?.code === "pkce_code_verifier_not_found" || error?.code === "bad_code_verifier") {
      throw new CallbackFlowError(recoveryHint
        ? "This reset link must be opened in the browser where you requested it. Request a new link to try again."
        : LINK_ERROR, recoveryHint);
    }
    if (error || !data.session || !data.user) throw new CallbackFlowError(recoveryHint ? RECOVERY_LINK_ERROR : LINK_ERROR, recoveryHint);
    // Supabase stores `/recovery` with the PKCE verifier and returns its
    // redirect type after exchange. The auth event is retained as a fallback.
    const purpose = exchangedCodePurpose((data as typeof data & { redirectType?: string | null }).redirectType, recoveryHint);
    if (purpose === "invalid-recovery" && !recovery) throw new CallbackFlowError(RECOVERY_LINK_ERROR, true);
    recovery = recovery || purpose === "recovery";
    if (recovery) recoverySession = data.session;
    else confirmed = Boolean(data.user.email_confirmed_at);
  } else if (tokenHash) {
    const type = url.searchParams.get("type");
    recovery = type === "recovery";
    if (type !== "email" && type !== "signup" && type !== "recovery") throw new CallbackFlowError(LINK_ERROR);
    if (type === "recovery") {
      const confirmation = createConfirmationClient();
      const { data, error } = await confirmation.auth.verifyOtp({ token_hash: tokenHash, type });
      if (error || !data.session || !data.user) throw new CallbackFlowError(RECOVERY_LINK_ERROR, true);
      recoverySession = data.session;
    } else {
      const response = await fetch("/auth/confirm", {
        method: "POST",
        credentials: "omit",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token_hash: tokenHash, type }),
      });
      if (!response.ok) throw new CallbackFlowError(LINK_ERROR);
      confirmed = (await response.json()).verified === true;
    }
  } else if (hash.get("access_token") && hash.get("refresh_token")) {
    const confirmation = createConfirmationClient();
    const { data, error } = await confirmation.auth.setSession({
      access_token: hash.get("access_token")!,
      refresh_token: hash.get("refresh_token")!,
    });
    recovery = hash.get("type") === "recovery";
    if (error || !data.session || !data.user) throw new CallbackFlowError(recovery ? RECOVERY_LINK_ERROR : LINK_ERROR, recovery);
    if (recovery) recoverySession = data.session;
    else confirmed = Boolean(data.user.email_confirmed_at);
  } else {
    throw new CallbackFlowError(LINK_ERROR);
  }

  if (recovery) {
    if (!recoverySession) throw new CallbackFlowError(RECOVERY_LINK_ERROR, true);
    // Recovery intentionally needs a persistent browser session so the user
    // can submit a new password on /reset-password.
    const { error: sessionError } = await supabase.auth.setSession(recoverySession);
    if (sessionError) throw new CallbackFlowError("We couldn't start password recovery. Please request a new reset link.", true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new CallbackFlowError("We couldn't start password recovery. Please request a new reset link.", true);
      const { data: claims, error: claimsError } = await supabase.auth.getClaims();
      const sessionId = claims?.claims?.session_id;
      if (claimsError || !sessionId) throw new CallbackFlowError("We couldn't verify this recovery session. Please request a new password reset link.", true);
      sessionStorage.setItem("maskanny-recovery", JSON.stringify({ userId: user.id, sessionId, expiresAt: Date.now() + 15 * 60_000 }));
    } catch (error) {
      try {
        sessionStorage.removeItem("maskanny-recovery");
      } catch {
        // Storage may be unavailable.
      }
      await supabase.auth.signOut({ scope: "local" }).catch(() => {});
      throw error;
    }
    return { kind: "recovery", destination: "/reset-password" };
  }
  if (!confirmed) throw new CallbackFlowError("We couldn't confirm your email from this link. Check your inbox or continue to Sign In to check your account.");
  clearPendingVerification();
  return { kind: "verified" };
}

export default function AuthCallbackPage() {
  const attempt = useRef<Promise<CallbackResult> | null>(null);
  const [pending] = useState<PendingVerification | null>(() => typeof window === "undefined" ? null : readPendingVerification());
  const [recoveryHint] = useState(() => {
    if (typeof window === "undefined") return false;
    const url = new URL(window.location.href);
    return hasRecoveryHint(url);
  });
  const [codeHint] = useState(() => typeof window !== "undefined" && new URL(window.location.href).searchParams.has("code"));
  const [error, setError] = useState<string | null>(null);
  const signInHref = pending?.next ? `/sign-in?next=${encodeURIComponent(pending.next)}` : "/sign-in";

  useEffect(() => {
    let active = true;
    const timeout = window.setTimeout(() => {
      if (!active) return;
      setError("This is taking longer than expected. You can request a new link if this one doesn't finish.");
    }, 15_000);
    attempt.current ??= completeLink();
    void attempt.current.then((result) => {
      if (!active) return;
      if (result.kind === "recovery") window.location.replace(result.destination);
      else window.location.replace(signInHref);
    }).catch((cause) => {
      if (!active) return;
      if (cause instanceof CallbackFlowError && cause.recovery) setError(cause.message);
      else if (recoveryHint) setError(RECOVERY_LINK_ERROR);
      else if (codeHint) window.location.replace(signInHref);
      else window.location.replace(signInHref);
    }).finally(() => window.clearTimeout(timeout));
    return () => { active = false; window.clearTimeout(timeout); };
  }, [codeHint, recoveryHint, signInHref]);

  return (
    <>
      <AuthHeading title={error ? "Link unavailable" : "Checking your link"} description={error ? "You can request another reset link or return to Sign In." : "This will only take a moment."} />
      {error ? (
        <div className="space-y-4">
          <AuthNotice message={error} />
          <AuthActionLink href="/forgot-password">Request a new reset link</AuthActionLink>
          <Link href={signInHref} className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--ink-2)] underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--ink)]">Back to sign in</Link>
        </div>
      ) : <p role="status" className="text-sm text-[var(--soft)]">Please wait…</p>}
    </>
  );
}

"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/src/lib/supabase/client";
import { hasValidRecoveryGrant, validateResetPasswords, type RecoveryGrant } from "@/src/lib/supabase/recovery-flow";
import { AuthActionLink, AuthButton, AuthField, AuthHeading, AuthNotice } from "../auth-ui";

export default function ResetPasswordPage() {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.all([supabase.auth.getUser(), supabase.auth.getClaims()]).then(([{ data, error: userError }, { data: claims, error: claimsError }]) => {
      if (active) {
        let recovery: RecoveryGrant = null;
        try {
          recovery = JSON.parse(sessionStorage.getItem("maskanny-recovery") || "null");
        } catch {
          recovery = null;
        }
        const sessionId = claims?.claims?.session_id;
        const eligible = !userError && !claimsError && hasValidRecoveryGrant(recovery, data.user?.id, sessionId);
        if (!eligible) sessionStorage.removeItem("maskanny-recovery");
        setAllowed(eligible);
        setChecking(false);
      }
    }).catch(() => {
      if (active) setChecking(false);
    });
    return () => { active = false; };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError(null);
    if (passwordUpdated) {
      setLoading(true);
      try {
        const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
        if (signOutError) setError("Your password was updated, but we couldn't finish signing you out. Please try again.");
        else setDone(true);
      } catch {
        setError("Your password was updated, but we couldn't finish signing you out. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }
    if (!allowed) {
      setError("This reset link is invalid or has expired. Request a new one to continue.");
      return;
    }
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");
    const validation = validateResetPasswords(password, confirmPassword);
    setFieldErrors(validation);
    if (validation.password || validation.confirmPassword) {
      return;
    }
    setLoading(true);
    let updated = false;
    try {
      const [{ data: { user }, error: userError }, { data: claims, error: claimsError }] = await Promise.all([supabase.auth.getUser(), supabase.auth.getClaims()]);
      const recovery = JSON.parse(sessionStorage.getItem("maskanny-recovery") || "null") as RecoveryGrant;
      const sessionId = claims?.claims?.session_id;
      if (userError || claimsError || !hasValidRecoveryGrant(recovery, user?.id, sessionId)) {
        setAllowed(false);
        setError("This reset link is invalid or has expired. Request a new one to continue.");
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        if (updateError.status === 401 || updateError.status === 403 || updateError.code === "session_not_found") {
          sessionStorage.removeItem("maskanny-recovery");
          setAllowed(false);
          setError("This reset link has expired. Request a new one to continue.");
        } else {
          setError(updateError.code === "weak_password"
            ? "Choose a stronger password."
            : updateError.code === "same_password"
              ? "Choose a password you haven't used before."
              : "We couldn't update your password. Please try again.");
        }
        return;
      }
      updated = true;
      sessionStorage.removeItem("maskanny-recovery");
      setAllowed(false);
      setPasswordUpdated(true);
      const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
      if (signOutError) {
        setError("Your password was updated, but we couldn't finish signing you out. Please try again.");
        return;
      }
      setDone(true);
    } catch {
      setError(updated ? "Your password was updated, but we couldn't finish signing you out. Please try again." : "We couldn't update your password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AuthHeading title="Set a new password" description="Enter a new password for your account." />
      {checking ? <p role="status" className="text-sm text-[var(--soft)]">Checking your reset link…</p> : done ? (
        <div className="space-y-4"><AuthNotice success message="Password updated successfully." /><AuthActionLink href="/sign-in">Continue to Sign In</AuthActionLink></div>
      ) : passwordUpdated ? (
        <form onSubmit={handleSubmit} className="space-y-4"><AuthNotice message={error} /><AuthButton loading={loading}>{loading ? "Signing out…" : "Finish and sign out"}</AuthButton></form>
      ) : !allowed ? (
        <div className="space-y-4"><AuthNotice message="This reset link is invalid or has expired. Request a new one to continue." /><AuthActionLink href="/forgot-password">Request a new link</AuthActionLink></div>
      ) : (
        <form method="post" noValidate onSubmit={handleSubmit} className="space-y-5">
          <div>
            <AuthField id="password" name="password" label="New password" type="password" autoComplete="new-password" minLength={8} placeholder="At least 8 characters" required aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password ? "password-error" : undefined} onInput={() => setFieldErrors((current) => ({ ...current, password: undefined }))} />
            {fieldErrors.password && <p id="password-error" role="alert" className="mt-2 text-sm text-[var(--danger)]">{fieldErrors.password}</p>}
          </div>
          <div>
            <AuthField id="confirmPassword" name="confirmPassword" label="Confirm new password" type="password" autoComplete="new-password" minLength={8} placeholder="Enter it again" required aria-invalid={Boolean(fieldErrors.confirmPassword)} aria-describedby={fieldErrors.confirmPassword ? "confirm-password-error" : undefined} onInput={() => setFieldErrors((current) => ({ ...current, confirmPassword: undefined }))} />
            {fieldErrors.confirmPassword && <p id="confirm-password-error" role="alert" className="mt-2 text-sm text-[var(--danger)]">{fieldErrors.confirmPassword}</p>}
          </div>
          <AuthNotice message={error} />
          <AuthButton loading={loading}>{loading ? "Updating password…" : "Update password"}</AuthButton>
        </form>
      )}
    </>
  );
}

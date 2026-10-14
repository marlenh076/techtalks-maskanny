"use client";

import { useRef, useState } from "react";
import { supabase } from "@/src/lib/supabase/client";

export function HostOnboardingButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  async function becomeHost() {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setError(null);
    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session) throw new Error("Please sign in again to continue.");
      const response = await fetch("/api/host", {
        method: "POST",
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      if (!response.ok && response.status !== 409) {
        throw new Error(response.status === 401 ? "Please sign in again to continue." : "We couldn't complete Host onboarding. Please try again.");
      }
      window.location.replace("/properties/create");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't complete Host onboarding.");
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      {error && <p role="alert" className="mb-3 text-sm text-[var(--danger)]">{error}</p>}
      <button type="button" onClick={() => void becomeHost()} disabled={loading} className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--btn-bg)] px-6 text-sm font-semibold text-[var(--btn-ink)] transition-colors enabled:hover:bg-[var(--btn-bg-hover)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-60">
        {loading ? "Setting up your Host account…" : "Become a Host"}
      </button>
    </div>
  );
}

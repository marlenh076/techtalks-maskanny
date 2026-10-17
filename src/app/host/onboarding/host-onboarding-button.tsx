"use client";

import { useRef, useState } from "react";
import { supabase } from "@/src/lib/supabase/client";
import { ArrowRight } from "lucide-react";
import styles from "./host-onboarding.module.css";

export function HostOnboardingButton() {
  const [phase, setPhase] = useState<"idle" | "activating" | "redirecting">("idle");
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  async function becomeHost() {
    if (inFlight.current) return;
    inFlight.current = true;
    setPhase("activating");
    setError(null);
    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session) throw new Error("Please sign in again to continue.");
      const response = await fetch("/api/host", {
        method: "POST",
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      if (!response.ok && response.status !== 409) {
        throw new Error(
          response.status === 401
            ? "Please sign in again to continue."
            : "We couldn't complete Host onboarding. Please try again.",
        );
      }
      setPhase("redirecting");
      window.location.replace("/properties/create");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't complete Host onboarding.");
      inFlight.current = false;
      setPhase("idle");
    }
  }

  return (
    <div className={styles.action}>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {phase === "redirecting" && (
        <p role="status" className={styles.status}>
          Your Host access is ready. Opening property creation…
        </p>
      )}
      <button
        type="button"
        onClick={() => void becomeHost()}
        disabled={phase !== "idle"}
        aria-busy={phase !== "idle"}
        className={styles.startButton}
      >
        {phase === "activating"
          ? "Getting things ready…"
          : phase === "redirecting"
            ? "Opening property form…"
            : "Get started"}
        <ArrowRight size={18} aria-hidden="true" />
      </button>
      <p className={styles.support}>You&apos;ll continue to the property creation process.</p>
    </div>
  );
}

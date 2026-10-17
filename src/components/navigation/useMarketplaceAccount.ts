"use client";

import { useCallback, useEffect, useState } from "react";
import { isAuthSessionMissingError } from "@supabase/supabase-js";
import { supabase } from "@/src/lib/supabase/client";

export type MarketplaceAccount =
  | { status: "loading" | "guest" | "error" }
  | {
      status: "authenticated";
      userId: string;
      name: string | null;
      email: string | null;
      role: "student" | "host" | "admin";
    };

// Shared by the hook and session lifecycle tests. Role and identity come from
// the validated Supabase user and database records, never browser storage.
export function subscribeMarketplaceAccount(onChange: (account: MarketplaceAccount) => void) {
  let active = true;
  let version = 0;

  async function resolveAccount(request: number) {
    if (!active || request !== version) return;
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (!active || request !== version) return;
      if (error && !isAuthSessionMissingError(error)) throw error;
      if (!user) {
        onChange({ status: "guest" });
        return;
      }
      const [profile, host] = await Promise.all([
        supabase
          .from("user")
          .select("role, firstname, lastname")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase.from("host").select("host_id").eq("user_id", user.id).maybeSingle(),
      ]);
      if (!active || request !== version) return;
      // A failed lookup must not mislabel an Admin or Host as a Student.
      if (profile.error || host.error || !profile.data) throw new Error("Account unavailable");
      onChange({
        status: "authenticated",
        userId: user.id,
        name:
          [profile.data.firstname, profile.data.lastname].filter(Boolean).join(" ").trim() || null,
        email: user.email ?? null,
        role: profile.data.role === "admin" ? "admin" : host.data ? "host" : "student",
      });
    } catch {
      if (active && request === version) onChange({ status: "error" });
    }
  }

  const initialRequest = ++version;
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event) => {
    if (!active) return;
    const request = ++version;
    // Clear the previous identity synchronously, before another async lookup.
    onChange({ status: event === "SIGNED_OUT" ? "guest" : "loading" });
    if (event !== "SIGNED_OUT") {
      // Supabase callbacks hold an auth lock; do not await auth/DB calls here.
      queueMicrotask(() => {
        void resolveAccount(request);
      });
    }
  });
  void resolveAccount(initialRequest);

  return () => {
    active = false;
    version++;
    subscription.unsubscribe();
  };
}

export function useMarketplaceAccount() {
  const [account, setAccount] = useState<MarketplaceAccount>({
    status: "loading",
  });
  const [revision, setRevision] = useState(0);
  useEffect(() => subscribeMarketplaceAccount(setAccount), [revision]);
  const reload = useCallback(() => {
    setAccount({ status: "loading" });
    setRevision((current) => current + 1);
  }, []);
  return { account, reload };
}

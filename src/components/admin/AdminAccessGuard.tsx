"use client";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { adminApi } from "@/src/features/admin/client/api";
import { useAdminAction, useAdminQuery } from "@/src/features/admin/client/hooks";
import { supabase } from "@/src/lib/supabase/client";
import type { AdminProfile } from "@/src/features/admin/models/admin.model";
import { QueryState, buttonClass } from "./AdminUI";

const AdminSession = createContext<{ profile: AdminProfile; refresh: () => void; logout: () => Promise<void>; loggingOut: boolean; } | null>(null);
export function useAdminSession() {
  const session = useContext(AdminSession);
  if (!session) throw new Error("Admin session is required");
  return session;
}
export default function AdminAccessGuard({ children }: { children: ReactNode; }) {
  const [denied, setDenied] = useState<number | null>(null);
  const [authRevision, setAuthRevision] = useState(0);
  const load = useCallback((signal: AbortSignal) => adminApi.profile(signal), []);
  const profile = useAdminQuery(denied === null ? `profile:${authRevision}` : null, load);
  const activeProfile = profile.data ?? profile.previousData;
  const action = useAdminAction();
  useEffect(() => {
    function deniedAccess(event: Event) { setDenied((event as CustomEvent<number>).detail); setAuthRevision(value => value + 1); }
    window.addEventListener("admin-access-denied", deniedAccess);
    const { data } = supabase.auth.onAuthStateChange(event => {
      if (event === "SIGNED_OUT") { setDenied(401); setAuthRevision(value => value + 1); }
      if (event === "SIGNED_IN") { setDenied(null); setAuthRevision(value => value + 1); }
    });
    return () => { window.removeEventListener("admin-access-denied", deniedAccess); data.subscription.unsubscribe(); };
  }, []);
  async function logout() {
    await action.run(async () => {
      await adminApi.logout();
      try {
        const { error } = await supabase.auth.signOut({ scope: "local" });
        if (error) throw new Error("Your session was revoked, but local session cleanup failed. Close this tab and sign in again.");
        window.location.replace("/sign-in");
      } finally { setDenied(401); }
    });
  }
  if (denied !== null || (activeProfile && activeProfile.role !== "admin")) return <div className="min-h-screen bg-brand-light flex items-center justify-center p-6"><div className="max-w-md bg-white rounded-2xl border border-brand-slate/15 p-6 space-y-4">
    <h1 className="text-xl font-bold text-brand-navy">{denied === 401 ? "Authentication required" : "Admin access required"}</h1>
    <p className="text-sm text-brand-slate">{denied === 401 ? "Sign in through Maskanny to continue." : "Your account does not have permission to view the Admin Dashboard."}</p>
    <QueryState error={action.error} />
    {denied === 401 && <Link className={buttonClass} href="/sign-in?next=%2Fadmin">Sign in</Link>}
    <button type="button" className={buttonClass} onClick={() => { setDenied(null); setAuthRevision(value => value + 1); }}>Check access again</button>
  </div></div>;
  if (!activeProfile) return <div className="min-h-screen bg-brand-light p-8"><QueryState loading={profile.loading} error={profile.error} retry={profile.reload} /></div>;
  return <AdminSession.Provider value={{ profile: activeProfile, refresh: profile.reload, logout, loggingOut: action.pending }}><QueryState error={action.error || profile.error} retry={profile.error ? profile.reload : undefined} />{children}</AdminSession.Provider>;
}

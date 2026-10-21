"use client";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { adminApi } from "@/src/features/admin/client/api";
import { useAdminAction, useAdminQuery } from "@/src/features/admin/client/hooks";
import { supabase } from "@/src/lib/supabase/client";
import type { AdminProfile } from "@/src/features/admin/models/admin.model";
import { QueryState, buttonClass } from "./AdminUI";

const AdminSession = createContext<{
  profile: AdminProfile;
  refresh: () => void;
  logout: () => Promise<void>;
  loggingOut: boolean;
} | null>(null);
export function useAdminSession() {
  const session = useContext(AdminSession);
  if (!session) throw new Error("Admin session is required");
  return session;
}
export default function AdminAccessGuard({ children }: { children: ReactNode }) {
  const [denied, setDenied] = useState<number | null>(null);
  const [authRevision, setAuthRevision] = useState(0);
  const load = useCallback((signal: AbortSignal) => adminApi.profile(signal), []);
  const profile = useAdminQuery(denied === null ? `profile:${authRevision}` : null, load);
  const activeProfile = profile.data ?? profile.previousData;
  const action = useAdminAction();
  useEffect(() => {
    function deniedAccess(event: Event) {
      setDenied((event as CustomEvent<number>).detail);
      setAuthRevision((value) => value + 1);
    }
    window.addEventListener("admin-access-denied", deniedAccess);
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setDenied(401);
        setAuthRevision((value) => value + 1);
      }
      if (event === "SIGNED_IN") {
        setDenied(null);
        setAuthRevision((value) => value + 1);
      }
    });
    return () => {
      window.removeEventListener("admin-access-denied", deniedAccess);
      data.subscription.unsubscribe();
    };
  }, []);
  async function logout() {
    await action.run(async () => {
      await adminApi.logout();
      try {
        const { error } = await supabase.auth.signOut({ scope: "local" });
        if (error)
          throw new Error(
            "Your session was revoked, but local session cleanup failed. Close this tab and sign in again.",
          );
        window.location.replace("/sign-in");
      } finally {
        setDenied(401);
      }
    });
  }
  if (denied !== null || (activeProfile && activeProfile.role !== "admin")) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center p-6">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-brand-slate/15 bg-white shadow-xl shadow-brand-navy/5">
          <div className="flex flex-col items-center px-8 pt-8 pb-6 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-brand-navy"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </div>

            <span className="mb-3 rounded-full bg-brand-light px-3 py-1 text-xs font-semibold tracking-wide text-brand-slate">
              {denied === 401 ? "AUTHENTICATION" : "RESTRICTED AREA"}
            </span>

            <h1 className="text-2xl font-bold tracking-tight text-brand-navy">
              {denied === 401 ? "Authentication required" : "Admin access required"}
            </h1>

            <p className="mt-3 max-w-sm text-sm leading-6 text-brand-slate">
              {denied === 401
                ? "Please sign in to your Maskanny account to continue to the administration dashboard."
                : "Your account does not have permission to access the Admin Dashboard. Please check your account and try again."}
            </p>
          </div>

          <div className="px-8 pb-8">
            <div className="mb-6">
              <QueryState error={action.error} />
            </div>

            <div className="flex flex-col gap-4">
              {denied === 401 && (
                <Link
                  className={`${buttonClass} flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm !text-white font-semibold shadow-sm transition-all duration-200 hover:shadow-md`}
                  href="/sign-in?next=%2Fadmin"
                >
                  Sign in to Maskanny
                </Link>
              )}

              <button
                type="button"
                className="flex w-full items-center justify-center rounded-xl border border-brand-slate/20 bg-white px-5 py-3 text-sm font-semibold text-brand-navy transition-all duration-200 hover:border-brand-navy/40 hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:ring-offset-2"
                onClick={() => {
                  setDenied(null);
                  setAuthRevision((value) => value + 1);
                }}
              >
                Check access again
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-brand-slate/70">
              Maskanny · Secure Admin Portal
            </p>
          </div>
        </div>
      </div>
    );
  }
  if (!activeProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <AdminSession.Provider
      value={{
        profile: activeProfile,
        refresh: () => setAuthRevision((value) => value + 1),
        logout,
        loggingOut: action.pending,
      }}
    >
      {children}
    </AdminSession.Provider>
  );
}

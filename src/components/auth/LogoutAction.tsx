"use client";

import { LogOut } from "lucide-react";
import { useLogout } from "@/src/lib/supabase/use-logout";

type LogoutActionProps = {
  fullWidth?: boolean;
};

export function LogoutAction({ fullWidth = false }: LogoutActionProps) {
  const { logout, loggingOut, logoutError } = useLogout();

  return (
    <div className={fullWidth ? "w-full" : "shrink-0"}>
      {logoutError && (
        <p role="alert" className="mb-2 max-w-64 text-xs text-[var(--danger)]">
          {logoutError}
        </p>
      )}
      <button
        type="button"
        onClick={() => void logout()}
        disabled={loggingOut}
        aria-busy={loggingOut}
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--line-strong)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--ink)] transition-colors enabled:hover:border-[var(--ink)] enabled:hover:bg-[var(--chip)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] disabled:cursor-wait disabled:opacity-60 ${fullWidth ? "w-full" : ""}`}
      >
        <LogOut aria-hidden="true" className="size-4" />
        <span>{loggingOut ? "Signing out…" : "Log Out"}</span>
      </button>
    </div>
  );
}

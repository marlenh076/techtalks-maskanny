"use client";

import { useRef, useState } from "react";
import { supabase } from "./client";

export function useLogout() {
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const inFlight = useRef(false);

  async function logout() {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoggingOut(true);
    setLogoutError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setLogoutError(error.message);
        return;
      }
      try {
        sessionStorage.removeItem("maskanny-recovery");
      } catch {
        // Storage may be unavailable; a successful sign-out must still redirect.
      }
      // A document navigation clears cached protected React content.
      window.location.replace("/sign-in");
    } catch {
      setLogoutError("We couldn't sign you out. Please try again.");
    } finally {
      inFlight.current = false;
      setLoggingOut(false);
    }
  }

  return { logout, loggingOut, logoutError };
}

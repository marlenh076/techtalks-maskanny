"use client";

/**
 * Remembers which dorm the student last opened, so the "Details" nav item has
 * somewhere real to go. Without this, Details would either be a dead link or
 * need removing from the nav.
 *
 * Stored per-browser in localStorage. Nothing server-side.
 */

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "maskani:last-viewed-dorm";

export function useLastViewedDorm() {
  const [lastViewedId, setLastViewedId] = useState<string | null>(null);

  // Read on mount only — localStorage isn't available during SSR.
  useEffect(() => {
    try {
      const value = window.localStorage.getItem(STORAGE_KEY);
      if (value) setLastViewedId(value);
    } catch {
      // Private browsing; the nav just falls back to Search.
    }
  }, []);

  /** Call from the details page when a dorm loads successfully. */
  const remember = useCallback((id: string) => {
    setLastViewedId(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Ignore — in-memory value still works for this session.
    }
  }, []);

  return { lastViewedId, remember };
}

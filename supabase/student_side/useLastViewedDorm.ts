"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "maskani:last-viewed-dorm";

export function useLastViewedDorm() {
  const [lastViewedId, setLastViewedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const value = window.localStorage.getItem(STORAGE_KEY);
      if (value) setLastViewedId(value);
    } catch {
      // Private browsing; nav just falls back to Search.
    }
  }, []);

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

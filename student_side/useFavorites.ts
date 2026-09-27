"use client";

/**
 * Saved dorms, kept in localStorage so they survive a refresh.
 *
 * When the backend gains a saved-dorms endpoint, swap the two localStorage
 * calls for API calls — the component interface (`isSaved` / `toggle`) stays
 * the same, so no card or page needs to change.
 */

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "maskani:saved-dorms";

export function useFavorites() {
  const [saved, setSaved] = useState<string[]>([]);

  // Read on mount only — localStorage isn't available during SSR.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSaved(parsed.filter((v) => typeof v === "string"));
      }
    } catch {
      // Private browsing or a corrupted value — start empty rather than crash.
    }
  }, []);

  const toggle = useCallback((id: string) => {
    setSaved((current) => {
      const next = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Saving failed; the in-memory state still updates for this session.
      }
      return next;
    });
  }, []);

  const isSaved = useCallback((id: string) => saved.includes(id), [saved]);

  return { saved, isSaved, toggle };
}

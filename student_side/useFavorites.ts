"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "maskani:saved-dorms";

export function useFavorites() {
  const [saved, setSaved] = useState<string[]>([]);
  // Mirrors `saved` synchronously so fast taps always see the latest list,
  // and keeps toast calls out of state updaters (which can run twice in dev).
  const savedRef = useRef<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const clean = parsed.filter((v): v is string => typeof v === "string");
          savedRef.current = clean;
          setSaved(clean);
        }
      }
    } catch {
      // Private browsing or corrupted value: start empty rather than crash.
    }
  }, []);

  const toggle = useCallback((id: string) => {
    const current = savedRef.current;
    const wasSaved = current.includes(id);
    const next = wasSaved ? current.filter((x) => x !== id) : [...current, id];

    savedRef.current = next;
    setSaved(next);

    let persisted = true;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      persisted = false;
    }

    // Same id per dorm: tapping repeatedly replaces the toast instead of stacking.
    const toastId = `favorite-${id}`;

    if (!persisted) {
      toast.warning("Saved for this session only", {
        id: toastId,
        description: "Your browser is blocking storage, so favorites won't be kept after you close the page.",
      });
      return;
    }

    if (wasSaved) toast.success("Removed from favorites", { id: toastId });
    else toast.success("Added to favorites", { id: toastId });
  }, []);

  const isSaved = useCallback((id: string) => saved.includes(id), [saved]);

  return { saved, isSaved, toggle };
}
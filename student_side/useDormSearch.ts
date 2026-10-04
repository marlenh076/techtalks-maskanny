"use client";

/**
 * Holds the filter state and the request lifecycle for the dorm search.
 * Components stay presentational — they read `status` and `dorms`, and call
 * `setFilter` / `resetFilters` / `retry`.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { searchDorms } from "@/lib/api/dorms";
import { EMPTY_FILTERS, type Dorm, type DormFilters } from "@/types/dorm";

// ─── DEMO DATA (temporary) ───────────────────────────────────────────────────
// Remove these two lines and the marked block below when the API is live.
// See src/lib/demo/dormSamples.ts for the full removal note.
import { USE_DEMO_DORMS, filterDemoDorms } from "@/lib/demo/dormSamples";
// ─────────────────────────────────────────────────────────────────────────────

export type SearchStatus = "idle" | "loading" | "success" | "error";

/** Wait this long after the last keystroke before calling the API. */
const DEBOUNCE_MS = 350;

export function useDormSearch(initialFilters: Partial<DormFilters> = {}) {
  const [filters, setFilters] = useState<DormFilters>({
    ...EMPTY_FILTERS,
    ...initialFilters,
  });
  const [dorms, setDorms] = useState<Dorm[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");

  // Bumping this re-runs the effect without changing filters — how "Try again"
  // works.
  const [attempt, setAttempt] = useState(0);

  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      // ─── DEMO DATA (temporary) ─────────────────────────────────────────────
      // Short-circuits before any network call. Delete this whole block to
      // restore API-only behaviour; nothing below it needs to change.
      if (USE_DEMO_DORMS) {
        setStatus("loading");
        const demoTimer = setTimeout(() => {
          setDorms(filterDemoDorms(filters));
          setStatus("success");
        }, 450); // fake latency so loading skeletons are visible
        return () => clearTimeout(demoTimer);
      }
      // ───────────────────────────────────────────────────────────────────────

      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setStatus("loading");

      searchDorms(filters, controller.signal)
        .then((results) => {
          if (controller.signal.aborted) return;
          setDorms(results);
          setStatus("success");
        })
        .catch((error: unknown) => {
          // An abort means we replaced the request on purpose, not a failure.
          if (error instanceof DOMException && error.name === "AbortError") return;
          if (controller.signal.aborted) return;
          console.error("Dorm search failed:", error);
          setDorms([]);
          setStatus("error");
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [filters, attempt]);

  // Cancel any in-flight request when the page unmounts.
  useEffect(() => () => controllerRef.current?.abort(), []);

  const setFilter = useCallback(
    <K extends keyof DormFilters>(key: K, value: DormFilters[K]) => {
      setFilters((current) => ({ ...current, [key]: value }));
    },
    []
  );

  const resetFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { filters, setFilter, resetFilters, dorms, status, retry };
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner"; // NEW
import { searchDorms } from "./dorms";
import { EMPTY_FILTERS, type Dorm, type DormFilters } from "./types";
import { USE_DEMO_DORMS, filterDemoDorms } from "./dormSamples";

export type SearchStatus = "idle" | "loading" | "success" | "error";

const DEBOUNCE_MS = 350;

export function useDormSearch(initialFilters: Partial<DormFilters> = {}) {
  const [filters, setFilters] = useState<DormFilters>({ ...EMPTY_FILTERS, ...initialFilters });
  const [dorms, setDorms] = useState<Dorm[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [attempt, setAttempt] = useState(0);
  const controllerRef = useRef<AbortController | null>(null);
  const retriedRef = useRef(false); // NEW: true after the student presses "Try again"

  useEffect(() => {
    const timer = setTimeout(() => {
      if (USE_DEMO_DORMS) {
        setStatus("loading");
        const demoTimer = setTimeout(() => {
          setDorms(filterDemoDorms(filters));
          setStatus("success");
        }, 450);
        return () => clearTimeout(demoTimer);
      }

      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setStatus("loading");

      searchDorms(filters, controller.signal)
        .then((results) => {
          if (controller.signal.aborted) return;
          setDorms(results);
          setStatus("success");
          retriedRef.current = false; // NEW
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          if (controller.signal.aborted) return;
          console.error("Dorm search failed:", error);
          setDorms([]);
          setStatus("error");
          // NEW: the page already shows an inline error, so only toast when a retry
          // fails too (otherwise the screen would look unchanged). Fixed id = no stacking.
          if (retriedRef.current) {
            toast.error("Still couldn't load the dorms", {
              id: "dorm-search-error",
              description: "Check your connection and try again.",
            });
          }
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [filters, attempt]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const setFilter = useCallback(
    <K extends keyof DormFilters>(key: K, value: DormFilters[K]) => {
      setFilters((current) => ({ ...current, [key]: value }));
    },
    []
  );

  const resetFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const retry = useCallback(() => {
    retriedRef.current = true; // NEW
    setAttempt((n) => n + 1);
  }, []);

  return { filters, setFilter, resetFilters, dorms, status, retry };
}
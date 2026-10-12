"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";

export function errorMessage(error: unknown) { return error instanceof z.ZodError ? "Check the required fields and their allowed values." : error instanceof Error ? error.message : "The request failed. Please try again."; }
/** Keyed results prevent stale responses from appearing after a filter change. */
export function useAdminQuery<T>(key: string | null, load: (signal: AbortSignal) => Promise<T>) {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{ key: string; data?: T; error?: string; }>();
  const [scope, setScope] = useState(key);
  // A closed dialog must not reuse a prior detail response when reopened.
  // Reset during the key transition, before any stale content can render.
  if (scope !== key) {
    setScope(key);
    setResult(undefined);
  }
  const currentKey = key === null ? null : `${key}:${revision}`;
  useEffect(() => {
    if (currentKey === null) return;
    const controller = new AbortController();
    load(controller.signal).then(data => {
      if (!controller.signal.aborted) setResult({ key: currentKey, data });
    }).catch(error => {
      if (!controller.signal.aborted) setResult({ key: currentKey, error: errorMessage(error) });
    });
    return () => controller.abort();
  }, [currentKey, load]);
  const matches = result?.key === currentKey;
  return {
    data: matches ? result?.data : undefined, error: matches ? result?.error : undefined,
    previousData: key !== null && result?.key.slice(0, result.key.lastIndexOf(":")) === key ? result.data : undefined,
    loading: currentKey !== null && !matches, reload: useCallback(() => setRevision(value => value + 1), [])
  };
}
export function useAdminAction() {
  const lock = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  async function run<T>(task: () => Promise<T>): Promise<{ ok: true; value: T; } | { ok: false; }> {
    if (lock.current) return { ok: false };
    lock.current = true; setPending(true); setError(undefined);
    try { return { ok: true, value: await task() }; }
    catch (failure) { setError(errorMessage(failure)); return { ok: false }; }
    finally { lock.current = false; setPending(false); }
  }
  return { run, pending, error };
}

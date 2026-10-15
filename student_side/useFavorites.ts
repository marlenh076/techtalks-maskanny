"use client";

import { useCallback, useSyncExternalStore } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "maskani:saved-dorms";
const EMPTY_SAVED: string[] = [];

let savedSnapshot: string[] | undefined;
const listeners = new Set<() => void>();

function readSavedSnapshot(): string[] {
  if (savedSnapshot) return savedSnapshot;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    savedSnapshot = Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : EMPTY_SAVED;
  } catch {
    // Private browsing or corrupted value: start empty rather than crash.
    savedSnapshot = EMPTY_SAVED;
  }

  return savedSnapshot;
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function handleStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  savedSnapshot = undefined;
  readSavedSnapshot();
  notifyListeners();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0)
      window.removeEventListener("storage", handleStorage);
  };
}

function getServerSnapshot() {
  return EMPTY_SAVED;
}

export function useFavorites() {
  const saved = useSyncExternalStore(
    subscribe,
    readSavedSnapshot,
    getServerSnapshot,
  );

  const toggle = useCallback((id: string) => {
    const current = readSavedSnapshot();
    const wasSaved = current.includes(id);
    const next = wasSaved ? current.filter((x) => x !== id) : [...current, id];

    savedSnapshot = next;

    let persisted = true;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      persisted = false;
    }

    notifyListeners();

    // Same id per dorm: tapping repeatedly replaces the toast instead of stacking.
    const toastId = `favorite-${id}`;

    if (!persisted) {
      toast.warning("Saved for this session only", {
        id: toastId,
        description:
          "Your browser is blocking storage, so favorites won't be kept after you close the page.",
      });
      return;
    }

    if (wasSaved) toast.success("Removed from favorites", { id: toastId });
    else toast.success("Added to favorites", { id: toastId });
  }, []);

  const isSaved = useCallback((id: string) => saved.includes(id), [saved]);

  return { saved, isSaved, toggle };
}

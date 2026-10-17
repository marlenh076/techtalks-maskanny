"use client";

import { useEffect, useState } from "react";
import type { University } from "../models/university.model";

function useUniversityResource<T>(path: string | null) {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{
    path: string;
    revision: number;
    data: T | null;
    status: "ready" | "error";
  } | null>(null);

  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    fetch(path, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load universities");
        return response.json() as Promise<T>;
      })
      .then((data) => {
        if (!controller.signal.aborted) setResult({ path, revision, data, status: "ready" });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ path, revision, data: null, status: "error" });
      });
    return () => controller.abort();
  }, [path, revision]);

  const current = result?.path === path && result.revision === revision;
  return {
    data: current ? result.data : null,
    status: !path ? "ready" : current ? result.status : "loading",
    retry: () => setRevision((value) => value + 1),
  };
}

export function useUniversities() {
  return useUniversityResource<University[]>("/api/universities");
}

export type UniversitiesResource = ReturnType<typeof useUniversities>;

export function useUniversity(id: string | undefined) {
  return useUniversityResource<University>(
    id ? `/api/universities/${encodeURIComponent(id)}` : null,
  );
}

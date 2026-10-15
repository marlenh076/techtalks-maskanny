"use client";

import { useEffect, useState } from "react";
import type { PropertyListing } from "../../service/discovery";

export function usePropertyListings(queryString = "", revision = 0) {
  const [result, setResult] = useState<{
    queryString: string;
    revision: number;
    properties: PropertyListing[];
    status: "ready" | "error";
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/properties${queryString ? `?${queryString}` : ""}`, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load properties");
        return response.json() as Promise<PropertyListing[]>;
      })
      .then((data) => {
        if (!controller.signal.aborted) setResult({ queryString, revision, properties: data, status: "ready" });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ queryString, revision, properties: [], status: "error" });
      });
    return () => controller.abort();
  }, [queryString, revision]);

  return {
    properties: result?.properties ?? [],
    status: result?.queryString === queryString && result.revision === revision ? result.status : "loading",
  };
}

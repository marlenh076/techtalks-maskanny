"use client";

import { useEffect, useState } from "react";
import type { PropertyListing } from "../../service/discovery";
import { publicJson } from "@/src/lib/public-json";

export function usePropertyListings(queryString = "", revision = 0) {
  const [result, setResult] = useState<{
    queryString: string;
    revision: number;
    properties: PropertyListing[];
    status: "ready" | "error";
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    publicJson<PropertyListing[]>(
      `/api/properties${queryString ? `?${queryString}` : ""}`,
      revision,
    )
      .then((data) => {
        if (!controller.signal.aborted)
          setResult({ queryString, revision, properties: data, status: "ready" });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setResult({ queryString, revision, properties: [], status: "error" });
      });
    return () => controller.abort();
  }, [queryString, revision]);

  return {
    properties: result?.properties ?? [],
    status:
      result?.queryString === queryString && result.revision === revision
        ? result.status
        : "loading",
  };
}

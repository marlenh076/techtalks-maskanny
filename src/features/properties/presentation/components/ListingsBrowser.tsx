"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, Search, Home } from "lucide-react";
import { PropertyListing } from "../../service/discovery";
import { PropertyCard } from "./PropertyCard";
import { PropertyFilters } from "./PropertyFilters";

const filterKeys = ["query", "property_type", "min_price", "max_price", "bedrooms", "bathrooms", "furnished", "electricity_included", "gender"];

export function ListingsBrowser({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const values = useMemo(() => Object.fromEntries(filterKeys.map((key) => [key, typeof searchParams[key] === "string" ? searchParams[key] : ""])) as Record<string, string>, [searchParams]);
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    for (const key of filterKeys) if (values[key]) params.set(key, values[key]);
    return params.toString();
  }, [values]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/properties${queryString ? `?${queryString}` : ""}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load properties");
        return response.json() as Promise<PropertyListing[]>;
      })
      .then((data) => { setProperties(data); setStatus("ready"); })
      .catch(() => { if (!controller.signal.aborted) setStatus("error"); });
    return () => controller.abort();
  }, [queryString]);

  return (
    <main className="student-marketplace min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <header className="border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto flex min-h-[72px] w-[calc(100%-48px)] max-w-[1184px] items-center justify-between gap-5 max-md:min-h-16 max-md:w-[calc(100%-32px)]">
          <Link href="/properties" className="flex items-center gap-2.5 text-xl font-extrabold tracking-[-0.035em] text-[var(--ink)]">
            <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-[var(--ink)] text-[var(--btn-ink)]"><Home size={19} /></span>
            Maskanny
          </Link>
          <span className="text-sm text-[var(--soft)] max-md:hidden">Find your place near campus</span>
        </div>
      </header>
      <div className="mx-auto w-[calc(100%-48px)] max-w-[1184px] pt-12 pb-[88px] max-md:w-[calc(100%-32px)] max-md:pt-9 max-md:pb-16">
        <div className="mb-[30px] max-md:mb-6">
          <span className="mb-[9px] block text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--ink-2)]">Student housing</span>
          <h1 className="m-0 max-w-[760px] text-[clamp(32px,4vw,48px)] font-extrabold leading-[1.15] tracking-[-0.04em] max-md:text-[32px]">
            Find a place that feels like yours
          </h1>
          <p className="mt-3 text-base leading-[1.6] text-[var(--soft)] max-md:text-[15px]">
            Explore student homes and find the right fit for your studies.
          </p>
        </div>
        <button
          type="button"
          className="mb-[25px] hidden min-h-14 w-full items-center justify-start gap-2 rounded-[12px] border border-[var(--line-strong)] bg-[var(--surface)] px-4 text-left text-sm font-medium text-[var(--soft)] hover:border-[var(--soft)] hover:bg-[var(--bg)] max-md:flex"
          onClick={() => setMobileOpen(true)}
        >
          <Search size={20} /> {values.query || "Search by city, address, or title"}
          <SlidersHorizontal size={18} className="ml-auto text-[var(--ink)]" />
        </button>
        <PropertyFilters values={values} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <section aria-label="Property listings">
          <div className="mb-5 flex items-center justify-between gap-4 text-sm font-semibold text-[var(--soft)]">
            <p className="m-0">{status === "ready" ? `${properties.length} ${properties.length === 1 ? "property" : "properties"} found` : status === "loading" ? "Searching properties…" : "Unable to load results"}</p>
            <button
              type="button"
              className="hidden min-h-11 items-center justify-center gap-2 rounded-[12px] border border-[var(--line-strong)] bg-[var(--surface)] px-[18px] text-sm font-bold text-[var(--ink)] hover:border-[var(--soft)] hover:bg-[var(--bg)] max-md:inline-flex"
              onClick={() => setMobileOpen(true)}
            >
              <SlidersHorizontal size={17} /> Filters
            </button>
          </div>
          {status === "loading" && (
            <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2 md:gap-6 lg:grid-cols-3" aria-label="Loading properties">
              {[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="h-[380px] animate-pulse rounded-3xl bg-[var(--surface)]" />)}
            </div>
          )}
          {status === "error" && (
            <div role="alert" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-10 text-center">
              <h2 className="text-xl font-bold">We couldn&apos;t load properties</h2>
              <p className="mt-2 text-[var(--soft)]">Please try again in a moment.</p>
              <button type="button" onClick={() => window.location.reload()} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-[12px] bg-[var(--btn-bg)] px-5 py-3 text-sm font-semibold text-[var(--btn-ink)] hover:bg-[var(--btn-bg-hover)]">Try again</button>
            </div>
          )}
          {status === "ready" && properties.length === 0 && (
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-10 text-center">
              <Search className="mx-auto text-[var(--faint)]" size={35} />
              <h2 className="mt-4 text-xl font-bold">{queryString ? "No homes match these filters" : "No homes are available yet"}</h2>
              <p className="mt-2 text-[var(--soft)]">{queryString ? "Try a different search or broaden your price range." : "Check back soon for approved student homes."}</p>
              {queryString && <Link href="/properties" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-[12px] bg-[var(--btn-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--btn-ink)] hover:bg-[var(--btn-bg-hover)] focus-visible:outline-[3px] focus-visible:outline-[var(--soft)] focus-visible:outline-offset-[3px]">Clear filters</Link>}
            </div>
          )}
          {status === "ready" && properties.length > 0 && (
            <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {properties.map((property) => <PropertyCard key={property.property_id} property={property} />)}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

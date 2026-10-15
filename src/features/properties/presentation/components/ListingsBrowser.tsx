"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Home, RotateCcw, GraduationCap, X } from "lucide-react";
import { useUniversity } from "@/src/features/universities/presentation/useUniversities";
import { useFavorites } from "@/student_side/useFavorites";
import { PropertyCard } from "./PropertyCard";
import { PropertyFilters } from "./PropertyFilters";
import { usePropertyListings } from "./usePropertyListings";

const filterKeys = ["university_id", "query", "property_type", "min_price", "max_price", "bedrooms", "bathrooms", "furnished", "electricity_included", "gender"];
const focusClass = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ink)]";
const stateButtonClass = `mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--btn-bg)] px-6 text-sm font-semibold text-[var(--btn-ink)] transition-colors hover:bg-[var(--btn-bg-hover)] motion-reduce:transition-none ${focusClass}`;

export function ListingsBrowser({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const router = useRouter();
  const { isSaved, toggle } = useFavorites();
  const [navigating, startNavigation] = useTransition();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const closeFilters = useCallback(() => setFiltersOpen(false), []);
  const values = useMemo(() => Object.fromEntries(filterKeys.map((key) => [key, typeof searchParams[key] === "string" ? searchParams[key] : ""])) as Record<string, string>, [searchParams]);
  const activeFilterCount = filterKeys.filter((key) => values[key]).length;
  const university = useUniversity(values.university_id);
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    for (const key of filterKeys) if (values[key]) params.set(key, values[key]);
    return params.toString();
  }, [values]);

  // Drafts reset on URL changes (including Back/Forward), but editing alone
  // never changes the applied filters or starts a request.
  const [draft, setDraft] = useState({ source: queryString, values });
  if (draft.source !== queryString) {
    setDraft({ source: queryString, values });
  }
  const [revision, setRevision] = useState(0);
  const { properties, status: listingStatus } = usePropertyListings(queryString, revision);
  const status = navigating ? "loading" : listingStatus;

  const search = (params: URLSearchParams) => {
    const nextQuery = params.toString();
    setDraft({ source: queryString, values: Object.fromEntries(params) });
    closeFilters();
    // Navigating to the same URL does not rerun the fetching effect.
    if (nextQuery === queryString) setRevision((current) => current + 1);
    startNavigation(() => {
      router.push(`/properties${nextQuery ? `?${nextQuery}` : ""}`, { scroll: false });
    });
  };
  const clearFilters = () => search(new URLSearchParams());
  const clearUniversity = () => {
    const params = new URLSearchParams(queryString);
    params.delete("university_id");
    search(params);
  };

  return (
    <main className="student-marketplace min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <div className="mx-auto w-[calc(100%-48px)] max-w-[1184px] pt-[42px] pb-20 max-md:w-[calc(100%-32px)] max-md:pt-8 max-md:pb-14">
        <div className="mb-6 sm:mb-4 md:mb-6">
          <span className="mb-3 inline-flex items-center gap-2 text-[11px] sm:mb-2 font-semibold uppercase tracking-[0.18em] text-[var(--ink-2)]"><span className="size-1.5 rounded-full bg-[var(--success)]" aria-hidden="true" /> Student housing, made simpler</span>
          <h1 className="m-0 max-w-[780px] text-[clamp(32px,4vw,49px)] font-medium leading-[1.04] tracking-[-0.045em] text-balance">A place to settle in.<br /><span className="text-[var(--success)]">A space to make your own.</span></h1>
          <p className="mt-4 max-w-[560px] text-[15px] leading-relaxed text-[var(--soft)] sm:mt-3 md:text-base">Explore student housing, compare monthly prices and find a place that fits your everyday life.</p>
        </div>
        {values.university_id && (
          <div aria-label="Selected university" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--success)]/15 bg-[var(--success-bg)] p-4 sm:px-5">
            <div className="flex min-w-0 flex-[1_1_100%] items-start gap-3 sm:flex-1">
              <GraduationCap size={23} aria-hidden="true" className="mt-1 shrink-0 text-[var(--success)]" />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--success)]">Housing connected to</p>
                <p role="status" className="mt-1 break-words text-sm font-semibold text-[var(--ink)]">{university.status === "loading" ? "Loading selected university…" : university.data?.name ?? "Selected university"}</p>
                {university.data?.city && <p className="mt-1 text-xs text-[var(--soft)]">{university.data.city}</p>}
                {university.status === "error" && <p className="mt-1 text-xs leading-relaxed text-[var(--soft)]">We couldn&apos;t load the university&apos;s name. Your university filter is still applied. <button type="button" onClick={university.retry} className={`rounded font-semibold underline underline-offset-2 ${focusClass}`}>Try again</button></p>}
              </div>
            </div>
            <button type="button" onClick={clearUniversity} aria-label="Clear university filter" className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-[var(--success)] hover:bg-white/70 ${focusClass}`}><X size={15} aria-hidden="true" />Clear university</button>
          </div>
        )}
        <PropertyFilters
          values={draft.values}
          expanded={filtersOpen}
          onExpandedChange={setFiltersOpen}
          onChange={(name, value) => setDraft((current) => ({ ...current, values: { ...current.values, [name]: value } }))}
          onSearch={search}
          onClear={clearFilters}
        />
        <section aria-labelledby="property-results-title" aria-busy={status === "loading"}>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-[var(--line-strong)] pb-5">
            <div>
              <h2 id="property-results-title" className="m-0 text-2xl font-medium tracking-[-0.03em]">{queryString ? "Your search results" : "Explore student homes"}</h2>
              <p role="status" aria-live="polite" aria-atomic="true" className="mt-1.5 text-[13px] text-[var(--soft)]">{status === "ready" ? `${properties.length} ${properties.length === 1 ? "property" : "properties"}${queryString ? " matching your search" : " to explore"}` : status === "loading" ? "Finding student homes…" : "Results are currently unavailable"}</p>
            </div>
            {activeFilterCount > 0 && <button type="button" onClick={clearFilters} className={`hidden min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-[var(--ink-2)] hover:bg-[var(--chip)] md:inline-flex ${focusClass}`}><RotateCcw size={13} aria-hidden="true" />Clear {activeFilterCount} {activeFilterCount === 1 ? "filter" : "filters"}</button>}
          </div>
          {status === "loading" && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
              {[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-2 motion-safe:animate-pulse"><div className="aspect-[4/3] rounded-[calc(var(--radius-md)-8px)] bg-[var(--placeholder-bg)]" /><div className="space-y-4 p-4"><div className="h-6 w-1/3 rounded bg-[var(--chip)]" /><div className="h-5 w-3/4 rounded bg-[var(--chip)]" /><div className="h-4 w-full rounded bg-[var(--bg)]" /><div className="h-12 rounded bg-[var(--bg)]" /></div></div>)}
            </div>
          )}
          {status === "error" && (
            <div role="alert" className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] px-6 py-14 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-[var(--danger-bg)] text-[var(--danger)]"><Home size={25} aria-hidden="true" /></span>
              <h3 className="mt-5 text-xl font-semibold tracking-[-0.025em]">We couldn&apos;t load the properties</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--soft)]">Please try again. Your search preferences will stay in place.</p>
              <button type="button" onClick={() => setRevision((current) => current + 1)} className={stateButtonClass}>Try again</button>
            </div>
          )}
          {status === "ready" && properties.length === 0 && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] px-6 py-14 text-center md:py-20">
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-[var(--chip)] text-[var(--ink-2)]"><Search size={27} strokeWidth={1.5} aria-hidden="true" /></span>
              <h3 className="mt-5 text-[22px] font-medium tracking-[-0.025em]">{values.university_id ? "No homes match your campus search yet" : queryString ? "Let’s widen the search" : "Your next home could be here soon"}</h3>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[var(--soft)]">{values.university_id ? "There are no available properties connected to this university that match your search. Adjust your filters or explore homes beyond this campus." : queryString ? "No properties match these filters. Try another location, adjust your budget or clear your filters to explore more options." : "There are no student properties to browse right now. Check back soon for new listings."}</p>
              {queryString && <button type="button" onClick={clearFilters} className={stateButtonClass}><RotateCcw size={16} aria-hidden="true" />{values.university_id ? "Explore all properties" : "Clear filters"}</button>}
            </div>
          )}
          {status === "ready" && properties.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => <PropertyCard key={property.property_id} property={property} saved={isSaved(property.property_id)} onToggleSave={toggle} />)}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

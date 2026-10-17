"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowUpRight, MapPin, RotateCcw, Search, X } from "lucide-react";
import type { UniversitiesResource } from "./useUniversities";
import { filterUniversities, universityMonogram } from "./university-browsing";

const focusClass =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-brand-navy)]";
const gridClass = "grid grid-cols-1 gap-2.5 min-[375px]:grid-cols-2 sm:gap-3 lg:grid-cols-3";

export function UniversityExplorer({ resource }: { resource: UniversitiesResource }) {
  const { data: universities, status, retry } = resource;
  const [query, setQuery] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);
  const filtered = filterUniversities(universities ?? [], query);
  const hasUniversities = status === "ready" && !!universities?.length;
  const clearSearch = () => {
    setQuery("");
    searchInput.current?.focus();
  };

  return (
    <section
      id="explore-universities"
      aria-labelledby="university-title"
      aria-busy={status === "loading"}
      className="scroll-mt-24 border-t border-[var(--line-strong)] pt-6 sm:pt-8"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-brand-navy)]">
            Find your campus
          </p>
          <h2
            id="university-title"
            className="m-0 text-[clamp(24px,3.1vw,36px)] font-medium leading-[1.12] tracking-[-0.035em] text-balance"
          >
            Your university. Your neighborhood.
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--soft)] sm:text-sm">
            Discover student housing connected to your university.
          </p>
        </div>
        {hasUniversities && (
          <div
            role="search"
            aria-label="University search"
            className="relative w-full sm:max-w-[320px]"
          >
            <label htmlFor="university-search" className="sr-only">
              Search universities
            </label>
            <Search
              size={17}
              aria-hidden="true"
              className="pointer-events-none absolute top-3.5 left-3.5 text-[var(--soft)]"
            />
            <input
              ref={searchInput}
              id="university-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or city"
              aria-describedby="university-search-status"
              className="min-h-11 w-full min-w-0 rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] py-3 pr-12 pl-10 text-[13px] text-[var(--ink)] placeholder:text-[var(--soft)] focus:border-[var(--color-brand-navy)] focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-brand-navy)] [&::-webkit-search-cancel-button]:appearance-none"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear university search"
                className={`absolute top-0 right-0 grid size-11 place-items-center rounded-xl text-[var(--soft)] hover:text-[var(--color-brand-navy)] ${focusClass}`}
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </div>
      {hasUniversities && (
        <p id="university-search-status" role="status" className="sr-only">
          {filtered.length} {filtered.length === 1 ? "university" : "universities"}
          {query.trim() ? " matching your search" : " to explore"}
        </p>
      )}
      {status === "loading" && (
        <div role="status" className={gridClass}>
          <span className="sr-only">Loading universities…</span>
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              aria-hidden="true"
              className="space-y-3 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] p-3 motion-safe:animate-pulse sm:p-4"
            >
              <div className="size-9 rounded-xl bg-[var(--chip)]" />
              <div className="h-4 w-4/5 rounded bg-[var(--chip)]" />
              <div className="h-3 w-1/2 rounded bg-[var(--chip)]" />
              <div className="h-5 w-2/3 rounded bg-[var(--chip)]" />
            </div>
          ))}
        </div>
      )}
      {status === "error" && (
        <div
          role="alert"
          className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] p-5"
        >
          <h3 className="text-lg font-semibold">We couldn&apos;t load the universities</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--soft)]">
            Please try again to find housing connected to your campus.
          </p>
          <button
            type="button"
            onClick={retry}
            className={`mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--color-brand-light)] px-4 text-sm font-semibold text-[var(--color-brand-navy)] hover:bg-[var(--chip)] ${focusClass}`}
          >
            <RotateCcw size={15} aria-hidden="true" />
            Try again
          </button>
        </div>
      )}
      {status === "ready" && universities?.length === 0 && (
        <div
          role="status"
          className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] p-5"
        >
          <Search size={24} aria-hidden="true" className="text-[var(--color-brand-navy)]" />
          <h3 className="mt-3 text-lg font-semibold">No universities to explore yet</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--soft)]">
            There are no universities to browse right now. You can still explore all available
            properties.
          </p>
          <Link
            href="/properties"
            className={`mt-4 inline-flex min-h-11 items-center gap-2 rounded-full text-sm font-semibold text-[var(--color-brand-navy)] ${focusClass}`}
          >
            Explore all properties
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      )}
      {hasUniversities && filtered.length === 0 && (
        <div className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] p-5">
          <h3 className="text-base font-semibold">No universities found</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--soft)]">
            Try another university name or city.
          </p>
          <button
            type="button"
            onClick={clearSearch}
            className={`mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--color-brand-light)] px-4 text-sm font-semibold text-[var(--color-brand-navy)] hover:bg-[var(--chip)] ${focusClass}`}
          >
            <RotateCcw size={15} aria-hidden="true" />
            Clear search
          </button>
        </div>
      )}
      {hasUniversities && filtered.length > 0 && (
        <div className={gridClass}>
          {filtered.map((university) => (
            <Link
              key={university.university_id}
              href={`/properties?university_id=${encodeURIComponent(university.university_id)}`}
              className={`group flex min-w-0 flex-col rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] p-3 transition-[border-color,box-shadow] hover:border-[var(--line-strong)] hover:shadow-[0_8px_24px_-18px_rgba(22,23,26,0.22)] motion-reduce:transition-none sm:p-4 ${focusClass}`}
            >
              <span
                aria-hidden="true"
                className="mb-2 grid size-9 place-items-center rounded-xl border border-[var(--color-brand-navy)]/10 bg-[var(--color-brand-light)] text-[10px] font-semibold tracking-[0.04em] text-[var(--color-brand-navy)]"
              >
                {universityMonogram(university)}
              </span>
              <h3 className="m-0 text-[13px] font-semibold leading-5 tracking-[-0.015em] [overflow-wrap:anywhere] sm:text-sm">
                {university.name}
              </h3>
              {university.city && (
                <p className="mt-1 mb-3 flex items-start gap-1 text-[11px] leading-4 text-[var(--soft)] sm:text-xs">
                  <MapPin size={12} aria-hidden="true" className="mt-0.5 shrink-0" />
                  <span className="[overflow-wrap:anywhere]">{university.city}</span>
                </p>
              )}
              <span className="mt-auto flex items-center justify-between gap-1 border-t border-[var(--line)] pt-2.5 text-[11px] font-semibold text-[var(--color-brand-navy)] sm:text-xs">
                Explore housing
                <ArrowUpRight size={15} aria-hidden="true" className="shrink-0" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

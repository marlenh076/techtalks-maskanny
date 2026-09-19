"use client";

/**
 * Student dorm search page (FR-S4, FR-S5, entry point to FR-S6).
 *
 * Client component because the search is interactive. If your project already
 * has a layout with a header and footer, this page inherits it — don't add
 * page chrome here.
 */

import { useState } from "react";
import DormHero from "@/components/dorms/DormHero";
import SearchBar from "@/components/dorms/SearchBar";
import DormFilterPanel from "@/components/dorms/DormFilterPanel";
import DormResults from "@/components/dorms/DormResults";
import { useDormSearch } from "@/hooks/useDormSearch";
import { useFavorites } from "@/hooks/useFavorites";
import { hasActiveFilters } from "@/types/dorm";

export default function DormSearchPage() {
  const { filters, setFilter, resetFilters, dorms, status, retry } =
    useDormSearch();
  const { isSaved, toggle } = useFavorites();

  const [filtersOpen, setFiltersOpen] = useState(false);

  const resultLabel =
    status === "success"
      ? dorms.length === 1
        ? "1 dorm"
        : `${dorms.length} dorms`
      : "Searching";

  return (
    <main className="min-h-screen bg-[#F4F2ED]">
      <DormHero listingCount={status === "success" ? dorms.length : undefined}>
        <div className="rounded-[32px] bg-white p-5 shadow-[0_24px_70px_-32px_rgba(22,23,26,0.4)] sm:p-7">
          <SearchBar
            value={filters.query}
            onChange={(value) => setFilter("query", value)}
          />
          <div className="mt-5">
            <DormFilterPanel
              filters={filters}
              onChange={setFilter}
              onReset={resetFilters}
              open={filtersOpen}
              onToggle={() => setFiltersOpen((open) => !open)}
            />
          </div>
        </div>
      </DormHero>

      <div className="mx-auto w-full max-w-6xl px-5 pb-28 pt-16 sm:px-8 lg:pt-20">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-black/[0.08] pb-5">
          <h2
            className="text-[26px] font-medium tracking-[-0.025em] text-[#16171A]"
            aria-live="polite"
          >
            {resultLabel}
            {status === "success" && filters.query ? ` for “${filters.query}”` : ""}
          </h2>
          <p className="text-sm text-[#6F7168]">
            Prices shown are per person, per month
          </p>
        </div>

        <div className="mt-10">
          <DormResults
            status={status}
            dorms={dorms}
            onRetry={retry}
            onReset={resetFilters}
            filtersApplied={hasActiveFilters(filters)}
            isSaved={isSaved}
            onToggleSave={toggle}
          />
        </div>
      </div>
    </main>
  );
}

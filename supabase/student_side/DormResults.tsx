"use client";

import DormCard from "./DormCard";
import type { SearchStatus } from "./useDormSearch";
import type { Dorm } from "./types";

interface DormResultsProps {
  status: SearchStatus;
  dorms: Dorm[];
  onRetry: () => void;
  onReset: () => void;
  filtersApplied: boolean;
  isSaved?: (id: string) => boolean;
  onToggleSave?: (id: string) => void;
}

const gridClass = "grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3";
const stateClass = "rounded-[28px] bg-white px-6 py-20 text-center ring-1 ring-black/[0.06]";
const ctaClass = "mt-7 rounded-full bg-[#16171A] px-7 py-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#33352F]";

function Skeleton() {
  return (
    <div className="overflow-hidden rounded-[28px] bg-white ring-1 ring-black/[0.06]">
      <div className="aspect-[5/4] w-full animate-pulse bg-[#E8E5DE] motion-reduce:animate-none" />
      <div className="space-y-3.5 p-6">
        <div className="h-4 w-3/4 animate-pulse rounded bg-[#E8E5DE] motion-reduce:animate-none" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-[#EEECE6] motion-reduce:animate-none" />
        <div className="h-10 w-full animate-pulse rounded-full bg-[#EEECE6] motion-reduce:animate-none" />
      </div>
    </div>
  );
}

export default function DormResults({ status, dorms, onRetry, onReset, filtersApplied, isSaved, onToggleSave }: DormResultsProps) {
  if (status === "loading" || status === "idle") {
    return (
      <div className={gridClass} aria-busy="true" aria-live="polite">
        {[0, 1, 2, 3, 4, 5].map((n) => <Skeleton key={n} />)}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div role="alert" className={stateClass}>
        <h3 className="text-[22px] font-medium tracking-[-0.02em] text-[#16171A]">
          Something went wrong. We couldn&apos;t load the dorms.
        </h3>
        <p className="mx-auto mt-3 max-w-[42ch] text-sm leading-relaxed text-[#6F7168]">
          The listings didn&apos;t come through. Check your connection and try again.
        </p>
        <button type="button" onClick={onRetry} className={ctaClass}>Try again</button>
      </div>
    );
  }

  if (dorms.length === 0) {
    return (
      <div className={stateClass}>
        <h3 className="text-[22px] font-medium tracking-[-0.02em] text-[#16171A]">
          No dorms found matching your search.
        </h3>
        <p className="mx-auto mt-3 max-w-[42ch] text-sm leading-relaxed text-[#6F7168]">
          Try a wider price range, or search a nearby area.
        </p>
        {filtersApplied && (
          <button type="button" onClick={onReset} className={ctaClass}>Clear filters</button>
        )}
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {dorms.map((dorm, index) => (
        <DormCard key={dorm.id} dorm={dorm} priority={index < 3} saved={isSaved?.(dorm.id) ?? false} onToggleSave={onToggleSave} />
      ))}
    </div>
  );
}

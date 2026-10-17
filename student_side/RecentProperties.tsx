"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Compass, GraduationCap, House, MapPin } from "lucide-react";
import { PropertyCard } from "@/src/features/properties/presentation/components/PropertyCard";
import { usePropertyListings } from "@/src/features/properties/presentation/components/usePropertyListings";
import { selectMostRecentlyActivatedProperty } from "@/src/features/properties/presentation/components/property-order";
import { useFavorites } from "./useFavorites";

const gridClass =
  "grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:grid-cols-3 lg:gap-6";

const stateClass =
  "rounded-[var(--radius-md)] border border-[#385F71]/20 bg-white px-5 py-10 text-center sm:px-6 sm:py-12";

const focusClass =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D7B377]";

function DiscoveryPanel() {
  return (
    <aside
      aria-label="Discover more student housing"
      className="relative hidden min-w-0 flex-col self-center overflow-hidden rounded-[var(--radius-md)] border border-[#385F71]/20 bg-[#E9EEF2] p-6 md:flex lg:col-span-2 lg:self-stretch lg:justify-between lg:p-10"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 hidden size-80 rounded-full border border-[#385F71]/15 lg:block"
      />

      <div>
        <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8F754F] lg:tracking-[0.16em]">
          <Compass size={16} aria-hidden="true" />
          Make yourself at home
        </span>

        <div
          aria-hidden="true"
          className="relative my-8 hidden max-w-sm items-center justify-between gap-3 lg:flex"
        >
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl border border-[#385F71]/20 bg-white/80 text-[#2B4162]">
            <House size={28} strokeWidth={1.5} />
          </span>

          <span className="h-px flex-1 border-t border-dashed border-[#385F71]/35" />

          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#2B4162] text-white">
            <MapPin size={18} />
          </span>

          <span className="h-px flex-1 border-t border-dashed border-[#385F71]/35" />

          <span className="grid size-16 shrink-0 place-items-center rounded-2xl border border-[#385F71]/20 bg-white/80 text-[#2B4162]">
            <GraduationCap size={30} strokeWidth={1.5} />
          </span>
        </div>

        <h3 className="mt-4 max-w-md text-[clamp(24px,2.4vw,30px)] font-medium leading-[1.15] tracking-[-0.03em] text-[#2B4162] lg:mt-0 lg:text-[36px] lg:leading-[1.12] lg:tracking-[-0.035em]">
          Start with the neighborhood.
          <br />
          Find your place in it.
        </h3>

        <p className="mt-3 max-w-md text-sm leading-6 text-[#385F71] lg:mt-4 lg:leading-7">
          <span className="lg:hidden">
            Explore available homes or start with your university to find a location that works for
            you.
          </span>

          <span className="hidden lg:inline">
            A good student home starts with a location that works for you. Explore the available
            properties or find housing connected to your university.
          </span>
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 lg:mt-8 lg:gap-y-3">
        <Link
          href="/properties"
          className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#2B4162] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#385F71] ${focusClass}`}
        >
          Explore All
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>

        <Link
          href="#explore-universities"
          className={`inline-flex min-h-11 items-center gap-2 rounded-full text-sm font-semibold text-[#2B4162] underline-offset-4 transition-colors hover:text-[#8F754F] hover:underline ${focusClass}`}
        >
          Browse by university
          <GraduationCap size={17} aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
}

function MobileExploreLink() {
  return (
    <Link
      href="/properties"
      aria-label="Explore more properties"
      className={`flex min-h-16 items-center gap-3 rounded-[var(--radius-sm)] border border-[#385F71]/20 bg-[#E9EEF2] px-4 py-3 text-[#2B4162] md:hidden ${focusClass}`}
    >
      <Compass size={21} aria-hidden="true" className="shrink-0" />

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">More places to explore</span>

        <span className="mt-0.5 block text-xs text-[#385F71]">Browse all student properties</span>
      </span>

      <ArrowUpRight size={17} aria-hidden="true" className="shrink-0" />
    </Link>
  );
}

export function RecentProperties() {
  const [revision, setRevision] = useState(0);
  const { properties, status } = usePropertyListings("", revision);
  const { isSaved, toggle } = useFavorites();

  if (status === "loading") {
    return (
      <div className={gridClass} aria-busy="true" role="status">
        <span className="sr-only">Loading recently listed properties…</span>

        {[0].map((item) => (
          <div
            key={item}
            aria-hidden="true"
            className="overflow-hidden rounded-[var(--radius-md)] border border-[#385F71]/20 bg-white p-2 motion-safe:animate-pulse"
          >
            <div className="aspect-[4/3] rounded-[calc(var(--radius-md)-8px)] bg-[#E9EEF2]" />

            <div className="space-y-4 p-4">
              <div className="h-6 w-1/3 rounded bg-[#E9EEF2]" />
              <div className="h-5 w-3/4 rounded bg-[#E9EEF2]" />
              <div className="h-4 rounded bg-[#E9EEF2]" />
              <div className="h-12 rounded bg-[#E9EEF2]" />
            </div>
          </div>
        ))}
        <DiscoveryPanel />
        <MobileExploreLink />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div role="alert" className={stateClass}>
        <h3 className="text-[22px] font-medium tracking-tight text-[#2B4162]">
          We couldn&apos;t load the properties
        </h3>

        <p className="mt-3 text-sm text-[#385F71]">Check your connection and try again.</p>

        <button
          type="button"
          onClick={() => setRevision((value) => value + 1)}
          className="mt-7 min-h-11 rounded-full bg-[#2B4162] px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-[#385F71] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D7B377]"
        >
          Try again
        </button>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className={gridClass}>
        <div role="status" className={stateClass}>
          <span className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-[#E9EEF2] text-[#2B4162]">
            <House size={28} strokeWidth={1.5} aria-hidden="true" />
          </span>

          <h3 className="text-[22px] font-medium tracking-tight text-[#2B4162]">
            Your next home could be here soon
          </h3>

          <p className="mt-3 text-sm text-[#385F71]">
            There are no student properties to browse right now. Check back soon for new listings.
          </p>

          <Link
            href="#explore-universities"
            className={`mt-5 inline-flex min-h-11 items-center gap-2 rounded-full text-sm font-semibold text-[#2B4162] transition-colors hover:text-[#8F754F] ${focusClass}`}
          >
            Find your university
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <DiscoveryPanel />
        <MobileExploreLink />
      </div>
    );
  }

  const newest = selectMostRecentlyActivatedProperty(properties);

  const layout =
    newest.length === 1
      ? "md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:grid-cols-3"
      : newest.length === 2
        ? "md:grid-cols-2"
        : "md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid grid-cols-1 gap-4 lg:gap-6 ${layout}`}>
      {newest.map((property) => (
        <PropertyCard
          key={property.property_id}
          property={property}
          saved={isSaved(property.property_id)}
          onToggleSave={toggle}
        />
      ))}

      {newest.length === 1 && (
        <>
          <DiscoveryPanel />
          <MobileExploreLink />
        </>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Heart, RefreshCw } from "lucide-react";
import { useFavorites } from "@/student_side/useFavorites";
import { PropertyCard } from "@/src/features/properties/presentation/components/PropertyCard";
import { usePropertyListings } from "@/src/features/properties/presentation/components/usePropertyListings";

const focusClass = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--success)]";
const gridClass = "grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3";

function SavedResults({ saved, toggle }: { saved: string[]; toggle: (id: string) => void }) {
  const [revision, setRevision] = useState(0);
  const { properties, status } = usePropertyListings("", revision);
  const matches = properties.filter((property) => saved.includes(property.property_id));
  if (status === "loading") return <div role="status" className={gridClass}><span className="sr-only">Loading saved properties…</span>{[0, 1, 2].map((item) => <div key={item} aria-hidden="true" className="h-72 rounded-2xl bg-[var(--bg)] motion-safe:animate-pulse" />)}</div>;
  if (status === "error") return <div role="alert" className="rounded-2xl bg-[var(--bg)] p-5"><p className="text-sm text-[var(--ink-2)]">We couldn&apos;t load your saved properties.</p><button type="button" onClick={() => setRevision((value) => value + 1)} className={`mt-2 inline-flex min-h-11 items-center gap-2 rounded-full text-sm font-semibold text-[var(--success)] ${focusClass}`}><RefreshCw size={15} aria-hidden="true" />Try again</button></div>;
  if (matches.length === 0) return <div role="status" className="rounded-2xl bg-[var(--bg)] p-5"><p className="text-sm font-semibold">No available saved properties</p><p className="mt-2 text-sm leading-6 text-[var(--soft)]">The homes saved in this browser aren&apos;t currently available to browse. Explore the latest listings to find another place.</p><ExploreLink /></div>;
  return <div className={gridClass}>{matches.map((property) => <PropertyCard key={property.property_id} property={property} saved onToggleSave={toggle} />)}</div>;
}

function ExploreLink() {
  return <Link href="/properties" className={`mt-2 inline-flex min-h-11 items-center gap-2 rounded-full text-sm font-semibold text-[var(--success)] ${focusClass}`}>Explore properties<ArrowUpRight size={16} aria-hidden="true" /></Link>;
}

export function SavedProperties() {
  const { saved, toggle } = useFavorites();
  return (
    <section aria-labelledby="saved-properties-title" className="min-w-0 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3"><Heart size={20} aria-hidden="true" className="mt-1 shrink-0 text-[var(--success)]" /><div className="min-w-0"><h2 id="saved-properties-title" className="m-0 text-xl font-medium tracking-tight">Saved properties</h2><p className="mt-1.5 text-sm leading-6 text-[var(--soft)]">Saved on this browser. Favorites aren&apos;t synced to your account or other devices.</p></div></div>
      {saved.length ? <SavedResults saved={saved} toggle={toggle} /> : <div className="rounded-2xl bg-[var(--bg)] p-5"><h3 className="m-0 text-base font-semibold">Keep your favorite places close</h3><p className="mt-2 text-sm leading-6 text-[var(--soft)]">Tap the heart on a property to save it here for later.</p><ExploreLink /></div>}
    </section>
  );
}

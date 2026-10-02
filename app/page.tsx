"use client";

/** This file goes at: app/page.tsx (replace the default one Next.js created) */

import Image from "next/image";
import Link from "next/link";
import DormResults from "../student_side/DormResults";
import { useDormSearch } from "../student_side/useDormSearch";
import { useFavorites } from "../student_side/useFavorites";

export default function HomePage() {
  const { dorms, status, retry, resetFilters } = useDormSearch();
  const { isSaved, toggle } = useFavorites();

  return (
    <main className="min-h-screen bg-[#F4F2ED]">
      <section className="relative h-[540px] overflow-hidden rounded-b-[40px] lg:h-[620px] lg:rounded-b-[56px]">
        <Image
          src="https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=2000&q=70"
          alt="Student housing in Beirut"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#16171A]/60 via-[#16171A]/25 to-[#16171A]/70" />
        <div className="relative flex h-full items-end px-5 pb-20 sm:px-8 lg:pb-24">
          <div className="mx-auto w-full max-w-6xl">
            <h1 className="max-w-[20ch] text-[44px] font-medium leading-[0.98] tracking-[-0.035em] text-white sm:text-[62px] lg:text-[72px]">
              Student housing, without the guesswork
            </h1>
            <p className="mt-6 max-w-[48ch] text-base leading-relaxed text-white/85">
              Maskani lists dorms near Lebanese universities with real prices, real distances, and a direct line to the owner.
            </p>
            <Link href="/dorms" className="mt-9 inline-block rounded-full bg-white px-7 py-4 text-sm font-medium text-[#16171A] transition-colors duration-200 hover:bg-[#EFEDE7]">
              Search dorms
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-black/[0.08] pb-5">
          <h2 className="text-[26px] font-medium tracking-[-0.025em] text-[#16171A]">Recently listed</h2>
          <Link href="/dorms" className="text-sm text-[#6F7168] underline-offset-4 transition-colors duration-200 hover:text-[#16171A] hover:underline">
            See all dorms
          </Link>
        </div>
        <div className="mt-10">
          <DormResults status={status} dorms={dorms.slice(0, 3)} onRetry={retry} onReset={resetFilters} filtersApplied={false} isSaved={isSaved} onToggleSave={toggle} />
        </div>
      </section>
    </main>
  );
}

"use client";

/** This file goes at: src/app/page.tsx */

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { RecentProperties } from "../../student_side/RecentProperties";
import { UniversityExplorer } from "@/src/features/universities/presentation/UniversityExplorer";
import { useUniversities } from "@/src/features/universities/presentation/useUniversities";
import { MarketplaceHero } from "../../student_side/MarketplaceHero";
import { MarketplaceFooter } from "@/src/components/navigation/MarketplaceFooter";

export default function HomePage() {
  const universities = useUniversities();

  return (
    <>
      <main className="student-marketplace min-h-screen bg-[#F5F0F6] text-[#2B4162]">
        <MarketplaceHero universities={universities} />

        <div className="mx-auto w-[calc(100%-32px)] max-w-[1184px] space-y-8 py-6 sm:w-[calc(100%-48px)] sm:space-y-12 sm:py-8">
          <section aria-labelledby="recent-properties-title">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-2 border-b border-[#385F71]/20 pb-4">
              <div className="max-w-xl">
                <h2
                  id="recent-properties-title"
                  className="m-0 text-[clamp(24px,3.1vw,30px)] font-medium leading-[1.12] tracking-[-0.035em] text-[#2B4162]"
                >
                  Recently added properties
                </h2>

                <p className="mt-2 text-[13px] leading-relaxed text-[#385F71] sm:text-sm">
                  The latest student housing listings.
                </p>
              </div>

              <Link
                href="/properties"
                className="inline-flex min-h-11 items-center gap-2 rounded-full text-sm font-semibold text-[#8F754F] underline-offset-4 transition-colors hover:text-[#2B4162] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D7B377]"
              >
                View all
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>

            <RecentProperties />
          </section>

          <UniversityExplorer resource={universities} />
        </div>
      </main>

      <MarketplaceFooter />
    </>
  );
}

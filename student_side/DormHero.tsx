"use client";

/**
 * Editorial hero for the student search page: full-bleed photo, headline over
 * it, and the search bar overlapping the bottom edge so search is the first
 * thing in reach.
 *
 * The heading animates in once on load — one deliberate moment, not a
 * per-section effect. It respects prefers-reduced-motion.
 */

import Image from "next/image";
import type { ReactNode } from "react";

interface DormHeroProps {
  /** The search bar and filter trigger get slotted in here. */
  children?: ReactNode;
  /** Number shown in the corner stat. Omit while still loading. */
  listingCount?: number;
}

export default function DormHero({ children, listingCount }: DormHeroProps) {
  return (
    <section className="relative">
      <div className="relative h-[560px] w-full overflow-hidden rounded-b-[40px] sm:h-[620px] lg:h-[680px] lg:rounded-b-[56px]">
        <Image
          // TEMPORARY hero photo — swap for your own asset in /public.
          src="https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=2000&q=70"
          alt="Student housing in Beirut"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#16171A]/55 via-[#16171A]/25 to-[#16171A]/70" />

        <div className="relative flex h-full flex-col justify-end px-6 pb-36 sm:px-10 lg:px-16 lg:pb-44">
          <div className="mx-auto w-full max-w-6xl">
            <p className="mask-fade-in text-sm text-white/80" style={{ animationDelay: "80ms" }}>
              Student housing across Lebanon
            </p>
            <h1
              className="mask-fade-in mt-4 max-w-[18ch] text-[44px] font-medium leading-[0.98] tracking-[-0.035em] text-white sm:text-[62px] lg:text-[76px]"
              style={{ animationDelay: "160ms" }}
            >
              A room near your campus
            </h1>
            <p
              className="mask-fade-in mt-6 max-w-[46ch] text-base leading-relaxed text-white/85"
              style={{ animationDelay: "260ms" }}
            >
              Compare verified dorms by price, distance and room type, then
              message the owner directly.
            </p>

            {typeof listingCount === "number" && (
              <p
                className="mask-fade-in mt-8 text-sm text-white/70"
                style={{ animationDelay: "340ms" }}
              >
                {listingCount} listings open right now
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Search panel overlaps the hero's lower edge. */}
      {children && (
        <div className="relative z-10 -mt-24 px-5 sm:px-8 lg:-mt-28">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </div>
      )}

      <style jsx>{`
        .mask-fade-in {
          opacity: 0;
          transform: translateY(14px);
          animation: maskRise 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes maskRise {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .mask-fade-in {
            opacity: 1;
            transform: none;
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}

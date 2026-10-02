"use client";

/** This file goes at: app/dorms/[id]/page.tsx (create "dorms" then inside it a folder literally named [id]) */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getDormById } from "../../../student_side/dorms";
import { useFavorites } from "../../../student_side/useFavorites";
import { useLastViewedDorm } from "../../../student_side/useLastViewedDorm";
import type { Dorm } from "../../../student_side/types";
import { USE_DEMO_DORMS, DEMO_DORMS } from "../../../student_side/dormSamples";

const GENDER_LABEL: Record<string, string> = { male: "Men only", female: "Women only", mixed: "Mixed" };

export default function DormDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { isSaved, toggle } = useFavorites();
  const { remember } = useLastViewedDorm();

  const [dorm, setDorm] = useState<Dorm | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!id) return;

    if (USE_DEMO_DORMS) {
      const match = DEMO_DORMS.find((d) => d.id === id) ?? null;
      setDorm(match);
      setStatus(match ? "success" : "error");
      if (match) remember(match.id);
      return;
    }

    const controller = new AbortController();
    setStatus("loading");
    getDormById(id, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setDorm(result);
        setStatus("success");
        remember(result.id);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("Failed to load dorm:", error);
        setStatus("error");
      });
    return () => controller.abort();
  }, [id, remember]);

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-[#F4F2ED] px-5 pb-16 pt-[136px] sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="h-[420px] w-full animate-pulse rounded-[32px] bg-[#E8E5DE] motion-reduce:animate-none" />
        </div>
      </main>
    );
  }

  if (status === "error" || !dorm) {
    return (
      <main className="min-h-screen bg-[#F4F2ED] px-5 pb-16 pt-[136px] sm:px-8">
        <div className="mx-auto max-w-2xl rounded-[28px] bg-white px-6 py-20 text-center ring-1 ring-black/[0.06]">
          <h1 className="text-[22px] font-medium tracking-[-0.02em] text-[#16171A]">We couldn&apos;t load this dorm.</h1>
          <p className="mx-auto mt-3 max-w-[40ch] text-sm leading-relaxed text-[#6F7168]">
            The listing may have been removed, or the connection dropped.
          </p>
          <Link href="/dorms" className="mt-7 inline-block rounded-full bg-[#16171A] px-7 py-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#33352F]">
            Back to search
          </Link>
        </div>
      </main>
    );
  }

  const saved = isSaved(dorm.id);

  return (
    <main className="min-h-screen bg-[#F4F2ED] pb-28 pt-[72px]">
      <div className="mx-auto w-full max-w-6xl px-5 pt-10 sm:px-8">
        <Link href="/dorms" className="inline-flex items-center gap-2 text-sm text-[#6F7168] transition-colors duration-200 hover:text-[#16171A]">
          <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true"><path d="M9.5 3.5 5 8l4.5 4.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
          All dorms
        </Link>

        <div className="mt-6 overflow-hidden rounded-[32px] bg-[#E8E5DE]">
          <div className="relative aspect-[16/9] w-full lg:aspect-[21/9]">
            {dorm.imageUrl ? (
              <Image src={dorm.imageUrl} alt={`${dorm.name} in ${dorm.location}`} fill priority sizes="100vw" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[#8A8B82]">No photos yet</div>
            )}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
          <div>
            <h1 className="text-[36px] font-medium leading-[1.05] tracking-[-0.03em] text-[#16171A] sm:text-[46px]">{dorm.name}</h1>
            <p className="mt-4 text-base text-[#6F7168]">
              {dorm.location}{dorm.university ? ` · near ${dorm.university}` : ""}
            </p>

            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-black/[0.08] pt-8 sm:grid-cols-3">
              {typeof dorm.distanceFromUniversity === "number" && (
                <div><dt className="text-[13px] text-[#6F7168]">From campus</dt><dd className="mt-1.5 text-lg text-[#16171A]">{dorm.distanceFromUniversity} km</dd></div>
              )}
              {typeof dorm.availableRooms === "number" && (
                <div><dt className="text-[13px] text-[#6F7168]">Rooms available</dt><dd className="mt-1.5 text-lg text-[#16171A]">{dorm.availableRooms}</dd></div>
              )}
              {dorm.roomType && (
                <div><dt className="text-[13px] text-[#6F7168]">Room type</dt><dd className="mt-1.5 text-lg text-[#16171A]">{dorm.roomType}</dd></div>
              )}
              {dorm.gender && GENDER_LABEL[dorm.gender] && (
                <div><dt className="text-[13px] text-[#6F7168]">Who it&apos;s for</dt><dd className="mt-1.5 text-lg text-[#16171A]">{GENDER_LABEL[dorm.gender]}</dd></div>
              )}
            </dl>

            {dorm.facilities && dorm.facilities.length > 0 && (
              <section className="mt-12 border-t border-black/[0.08] pt-8">
                <h2 className="text-[22px] font-medium tracking-[-0.02em] text-[#16171A]">What&apos;s included</h2>
                <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {dorm.facilities.map((facility) => (
                    <li key={facility} className="flex items-center gap-3 text-[15px] text-[#3F4139]">
                      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#16171A]" />
                      {facility}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-[28px] bg-white p-7 ring-1 ring-black/[0.06]">
              <p className="text-[32px] font-medium tracking-[-0.03em] text-[#16171A]">
                ${dorm.price.toLocaleString("en-US")}<span className="ml-1.5 text-sm font-normal text-[#6F7168]">/ month</span>
              </p>
              <button type="button" className="mt-7 w-full rounded-full bg-[#16171A] py-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#33352F]">
                Contact the owner
              </button>
              <button
                type="button"
                onClick={() => toggle(dorm.id)}
                aria-pressed={saved}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-black/[0.1] py-4 text-sm font-medium text-[#16171A] transition-colors duration-200 hover:border-[#16171A]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path d="M12 20.3 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13z" fill={saved ? "#16171A" : "none"} stroke="#16171A" strokeWidth="1.7" strokeLinejoin="round" />
                </svg>
                {saved ? "Saved" : "Save this dorm"}
              </button>
              <p className="mt-5 text-[13px] leading-relaxed text-[#6F7168]">
                Visit before you pay a deposit, and report anything that doesn&apos;t match this listing.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

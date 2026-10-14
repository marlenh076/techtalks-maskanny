"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import type { Property } from "../../models/property.model";
import type { Media } from "../../models/media.model";
import type { University } from "@/src/features/universities/models/university.model";
import { PropertyGallery } from "./PropertyGallery";
import { PropertyAmenities } from "./PropertyAmenities";
import { PropertyUniversities } from "./PropertyUniversities";
import { ContactHost } from "./ContactHost";

type DetailsState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "error" }
  | {
      status: "ready";
      property: Property;
      media: Media[];
      universities: University[];
      mediaError: boolean;
      universityError: boolean;
    };

export default function PropertyDetails({
  propertyId,
}: {
  propertyId: string;
}) {
  const [state, setState] = useState<DetailsState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(`/api/properties/${propertyId}`, {
          signal: controller.signal,
        });
        if (response.status === 404 || response.status === 400) {
          setState({ status: "not-found" });
          return;
        }
        if (!response.ok) throw new Error("Property request failed");
        const property = (await response.json()) as Property;
        if (property.approval_status !== "approved") {
          setState({ status: "not-found" });
          return;
        }

        const [mediaResult, universityResult] = await Promise.allSettled([
          fetch(`/api/properties/${propertyId}/media`, {
            signal: controller.signal,
          }).then(async (res) => {
            if (!res.ok) throw new Error("Media request failed");
            return res.json() as Promise<Media[]>;
          }),
          fetch(`/api/properties/${propertyId}/universities`, {
            signal: controller.signal,
          }).then(async (res) => {
            if (!res.ok) throw new Error("University request failed");
            return res.json() as Promise<University[]>;
          }),
        ]);
        if (controller.signal.aborted) return;
        setState({
          status: "ready",
          property,
          media: mediaResult.status === "fulfilled" ? mediaResult.value : [],
          universities:
            universityResult.status === "fulfilled"
              ? universityResult.value
              : [],
          mediaError: mediaResult.status === "rejected",
          universityError: universityResult.status === "rejected",
        });
      } catch {
        if (!controller.signal.aborted) setState({ status: "error" });
      }
    }
    load();
    return () => controller.abort();
  }, [propertyId]);

  if (state.status === "loading")
    return (
      <main className="student-marketplace min-h-screen bg-[var(--bg)] px-5 py-10 text-[var(--ink)] sm:px-8">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-8 w-60 rounded-[12px] bg-[var(--placeholder-bg)]" />
          <div className="mt-7 h-96 rounded-3xl bg-[var(--surface)]" />
          <div className="mt-7 h-60 rounded-3xl bg-[var(--surface)]" />
        </div>
      </main>
    );

  if (state.status === "not-found" || state.status === "error")
    return (
      <main className="student-marketplace min-h-screen bg-[var(--bg)] px-5 py-24 text-center text-[var(--ink)]">
        <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">
          {state.status === "not-found"
            ? "Property not found"
            : "We couldn't load this property"}
        </h1>
        <p className="mt-3 text-[var(--soft)]">
          {state.status === "not-found"
            ? "This listing may have been removed or is not available yet."
            : "Please try again in a moment."}
        </p>
        <Link
          href="/properties"
          className="mt-7 inline-block rounded-[12px] bg-[var(--btn-bg)] px-6 py-3 text-sm font-semibold text-[var(--btn-ink)] hover:bg-[var(--btn-bg-hover)]"
        >
          Browse properties
        </Link>
        </div>
      </main>
    );

  const { property, media, universities, mediaError, universityError } = state;
  return (
    <main className="student-marketplace min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <div className="mx-auto w-[calc(100%-48px)] max-w-[1180px] pt-8 pb-24 max-[760px]:w-[calc(100%-32px)]">
        <Link href="/properties" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--soft)] hover:text-[var(--ink)]">
          <ArrowLeft size={17} /> All properties
        </Link>
        <article className="mt-8">
          <header className="mb-[38px] flex items-end justify-between gap-10 max-[760px]:flex-col max-[760px]:items-start max-[760px]:gap-6">
            <div className="min-w-0">
              <div className="mb-[18px] flex items-center gap-[7px] text-[13px] text-[var(--soft)]">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--chip)] text-[var(--ink)]"><MapPin size={15} /></span>
                <span>{property.address}</span>
              </div>
              <h1 className="m-0 max-w-[780px] text-[clamp(40px,5vw,64px)] font-medium leading-[0.98] tracking-[-0.045em] max-[520px]:text-[40px]">{property.title}</h1>
              {universities.length > 0 && !universityError && (
                <p className="mt-[18px] text-[15px] leading-normal text-[var(--soft)]">Near {universities[0].name}</p>
              )}
            </div>
            <p className="flex shrink-0 items-baseline gap-1.5 whitespace-nowrap pb-[5px]">
              <span className="text-[34px] font-medium tracking-[-0.035em]">${property.price.toLocaleString()}</span>
              <span className="text-sm text-[var(--soft)]">/ month</span>
            </p>
          </header>
          {mediaError && (
            <p role="alert" className="my-5 rounded-[var(--radius-sm)] bg-[var(--chip)] px-[18px] py-4 text-sm text-[var(--ink-2)]">
              Photos could not be loaded right now.
            </p>
          )}
          <PropertyGallery media={media} title={property.title} propertyType={property.property_type} />
          <section className="mt-[18px] grid grid-cols-4 overflow-hidden rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] max-[760px]:grid-cols-2 max-[520px]:grid-cols-1" aria-label="Property highlights">
            <div className="border-r border-[var(--line)] px-6 py-[22px] max-[760px]:border-b max-[520px]:border-r-0"><span className="mb-[7px] block text-xs text-[var(--soft)]">Property type</span><strong className="text-sm font-medium capitalize text-[var(--ink)]">{property.property_type}</strong></div>
            <div className="border-r border-[var(--line)] px-6 py-[22px] max-[760px]:border-r-0 max-[760px]:border-b"><span className="mb-[7px] block text-xs text-[var(--soft)]">Gender</span><strong className="text-sm font-medium capitalize text-[var(--ink)]">{property.gender}</strong></div>
            <div className="border-r border-[var(--line)] px-6 py-[22px] max-[520px]:border-r-0 max-[520px]:border-b"><span className="mb-[7px] block text-xs text-[var(--soft)]">Furnished</span><strong className="text-sm font-medium capitalize text-[var(--ink)]">{property.furnished ? "Yes" : "No"}</strong></div>
            <div className="px-6 py-[22px]"><span className="mb-[7px] block text-xs text-[var(--soft)]">Availability</span><strong className="text-sm font-medium capitalize text-[var(--ink)]">Confirm with host</strong></div>
          </section>
          <div className="mt-[76px] grid grid-cols-[minmax(0,1fr)_350px] items-start gap-[72px] max-[1000px]:grid-cols-1 max-[1000px]:gap-12 max-[760px]:mt-[52px]">
            <div className="min-w-0">
              <section className="mb-14 border-b border-[var(--line)] pb-14 last:mb-0 last:border-b-0">
                <span className="mb-3.5 block text-[11px] font-semibold uppercase tracking-[0.13em] text-[var(--soft)]">About</span>
                <h2 className="mb-[22px] text-[30px] font-medium tracking-[-0.03em] text-[var(--ink)] max-[520px]:text-[26px]">About this property</h2>
                <p className="max-w-[680px] whitespace-pre-line text-base leading-[1.75] text-[var(--ink-2)]">
                  {property.description?.trim() || "The host has not added a description yet."}
                </p>
              </section>
              <section className="mb-14 border-b border-[var(--line)] pb-14 last:mb-0 last:border-b-0">
                <span className="mb-3.5 block text-[11px] font-semibold uppercase tracking-[0.13em] text-[var(--soft)]">What&apos;s included</span>
                <h2 className="mb-[22px] text-[30px] font-medium tracking-[-0.03em] text-[var(--ink)] max-[520px]:text-[26px]">Property features</h2>
                <PropertyAmenities property={property} />
              </section>
              {universityError ? (
                <section role="alert" className="mb-14 rounded-[var(--radius-sm)] border-b border-[var(--line)] bg-[var(--chip)] px-[18px] py-4 text-sm text-[var(--ink-2)]">
                  University information could not be loaded right now.
                </section>
              ) : (
                <PropertyUniversities universities={universities} />
              )}
              <section className="mb-14 border-b border-[var(--line)] pb-14 last:mb-0 last:border-b-0">
                <span className="mb-3.5 block text-[11px] font-semibold uppercase tracking-[0.13em] text-[var(--soft)]">Before you move in</span>
                <h2 className="mb-[22px] text-[30px] font-medium tracking-[-0.03em] text-[var(--ink)] max-[520px]:text-[26px]">House rules</h2>
                <div className="flex items-start gap-3.5 rounded-[var(--radius-sm)] bg-[var(--surface)] p-5 shadow-[0_0_0_1px_var(--line)]">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--ink)] text-xs font-semibold text-[var(--surface)]" aria-hidden="true">i</span>
                  <p className="mt-[3px] text-sm leading-[1.65] text-[var(--ink-2)]">Ask the host about house rules before arranging a viewing.</p>
                </div>
              </section>
            </div>
            <aside className="max-[1000px]:-order-1">
              <div className="sticky top-8 rounded-[var(--radius-lg)] bg-[var(--surface)] p-7 shadow-[0_0_0_1px_var(--line),0_20px_60px_-42px_rgba(22,23,26,0.35)] max-[1000px]:static max-[520px]:p-6">
                <span className="mb-[18px] block text-[13px] text-[var(--soft)]">Interested in this place?</span>
                <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                  <strong className="text-[32px] font-medium tracking-[-0.035em]">${property.price.toLocaleString()}</strong><span className="text-sm text-[var(--soft)]">/ month</span>
                </div>
                <div className="my-6 h-px bg-[var(--line)]" />
                <div className="flex justify-between gap-5 py-2.5 text-[13px]"><span className="shrink-0 text-[var(--soft)]">Location</span><strong className="max-w-[190px] text-right font-medium [overflow-wrap:anywhere]">{property.address}</strong></div>
                <div className="flex justify-between gap-5 py-2.5 text-[13px]"><span className="shrink-0 text-[var(--soft)]">University</span><strong className="max-w-[190px] text-right font-medium [overflow-wrap:anywhere]">{universityError ? "Information unavailable" : universities.length ? universities.map((university) => university.name).join(", ") : "Not linked"}</strong></div>
                <div className="flex justify-between gap-5 py-2.5 text-[13px]"><span className="shrink-0 text-[var(--soft)]">Availability</span><strong className="max-w-[190px] text-right font-medium [overflow-wrap:anywhere]">Confirm with host</strong></div>
                <ContactHost propertyId={property.property_id} />
              </div>
            </aside>
          </div>
        </article>
      </div>
    </main>
  );
}

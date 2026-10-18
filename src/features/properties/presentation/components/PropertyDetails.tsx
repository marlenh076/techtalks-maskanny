"use client";

import { useEffect, useState } from "react";
import { publicJson, PublicRequestError } from "@/src/lib/public-json";
import Link from "next/link";
import { ArrowLeft, Building2, Heart, House, MapPin, Users } from "lucide-react";
import type { Property } from "../../models/property.model";
import type { Media } from "../../models/media.model";
import type { University } from "@/src/features/universities/models/university.model";
import { useFavorites } from "@/student_side/useFavorites";
import { PropertyGallery } from "./PropertyGallery";
import { PropertyAmenities, residentLabels } from "./PropertyAmenities";
import { PropertyUniversities } from "./PropertyUniversities";
import { PropertyLocation } from "./PropertyLocation";
import { ContactHost } from "./ContactHost";
import styles from "./PropertyDetails.module.css";

export type PropertyDetailsData = {
  property: Property;
  media: Media[];
  universities: University[];
  mediaError?: boolean;
  universityError?: boolean;
};

type DetailsState = { status: "not-found" | "error" } | ({ status: "ready" } & PropertyDetailsData);

export function PropertyDetailsContent({
  property,
  media,
  universities,
  mediaError,
  universityError,
  onRetry,
}: PropertyDetailsData & { onRetry?: () => void }) {
  const { isSaved, toggle } = useFavorites();
  const saved = isSaved(property.property_id);
  const type = {
    studio: { label: "Studio", icon: House, className: "" },
    apartment: { label: "Apartment", icon: Building2, className: styles.apartment },
    dorm: { label: "Dorm", icon: Building2, className: styles.dorm },
  }[property.property_type];
  const TypeIcon = type?.icon ?? House;
  const created = new Date(property.created_at);
  return (
    <main className={styles.page}>
      <article className={styles.container}>
        <Link href="/properties" className={styles.back}>
          <ArrowLeft size={17} aria-hidden="true" />
          All properties
        </Link>
        <header className={styles.header}>
          <div className={styles.heading}>
            <div className={styles.badges}>
              <span className={`${styles.badge} ${type?.className ?? ""}`}>
                <TypeIcon size={14} aria-hidden="true" />
                {type?.label ?? "Property"}
              </span>
              {residentLabels[property.gender] && (
                <span className={`${styles.badge} ${styles.resident}`}>
                  <Users size={14} aria-hidden="true" />
                  {residentLabels[property.gender]}
                </span>
              )}
            </div>
            <h2 className={styles.title}>{property.title}</h2>
            <p className={styles.address}>
              <MapPin size={17} aria-hidden="true" />
              <span>{property.address || "Address not provided"}</span>
            </p>
          </div>
          <button
            type="button"
            className={styles.favorite}
            aria-label={`${saved ? "Unsave" : "Save"} ${property.title}`}
            aria-pressed={saved}
            onClick={() => toggle(property.property_id)}
          >
            <Heart size={21} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
          </button>
        </header>
        {mediaError && (
          <p role="alert" className={styles.notice}>
            Photos and videos couldn’t be loaded.{" "}
            {onRetry && (
              <button type="button" className={styles.retry} onClick={onRetry}>
                Try again
              </button>
            )}
          </p>
        )}
        <PropertyGallery media={media} title={property.title} />
        <div className={styles.body}>
          <div className={styles.content}>
            <section className={styles.section} aria-labelledby="property-overview-title">
              <h2 id="property-overview-title">About this place</h2>
              <p className={styles.description}>
                {property.description?.trim() || "The host hasn’t added a description yet."}
              </p>
              {Number.isFinite(created.getTime()) && (
                <time className={styles.listed} dateTime={property.created_at}>
                  Listed{" "}
                  {new Intl.DateTimeFormat("en-GB", {
                    dateStyle: "medium",
                    timeZone: "Asia/Beirut",
                  }).format(created)}
                </time>
              )}
            </section>
            <PropertyAmenities property={property} />
            {universityError ? (
              <section className={styles.section} aria-labelledby="property-universities-title">
                <h2 id="property-universities-title">Associated universities</h2>
                <p role="alert" className={styles.muted}>
                  University information couldn’t be loaded.
                </p>
                {onRetry && (
                  <button type="button" className={styles.retry} onClick={onRetry}>
                    Try again
                  </button>
                )}
              </section>
            ) : (
              <PropertyUniversities universities={universities} />
            )}
            <PropertyLocation
              latitude={property.latitude}
              longitude={property.longitude}
              address={property.address}
            />
          </div>
          <aside className={styles.aside} aria-label="Monthly rent and host contact">
            <div className={styles.contactPanel}>
              <p className={styles.priceLabel}>Monthly rent</p>
              <div className={styles.price}>
                <strong>
                  {typeof property.price === "number" && Number.isFinite(property.price)
                    ? `$${property.price.toLocaleString("en-US")}`
                    : "Price not provided"}
                </strong>
                <span>/month</span>
              </div>
              <hr />
              <h2>Interested in this place?</h2>
              <p className={styles.muted}>
                Get in touch with the host to ask questions or arrange a viewing.
              </p>
              <ContactHost propertyId={property.property_id} />
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}

export default function PropertyDetails({ propertyId }: { propertyId: string }) {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{
    id: string;
    revision: number;
    state: DetailsState;
  } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const commit = (state: DetailsState) => {
      if (!controller.signal.aborted) setResult({ id: propertyId, revision, state });
    };
    const url = `/api/properties/${encodeURIComponent(propertyId)}`;
    async function load() {
      try {
        let property: Property;
        try {
          property = await publicJson<Property>(url, revision);
        } catch (error) {
          if (
            error instanceof PublicRequestError &&
            (error.status === 404 || error.status === 400)
          ) {
            commit({ status: "not-found" });
            return;
          }
          throw error;
        }
        if (controller.signal.aborted) return;
        if (property.approval_status !== "approved") {
          commit({ status: "not-found" });
          return;
        }
        const [media, universities] = await Promise.allSettled([
          publicJson<Media[]>(`${url}/media`, revision),
          publicJson<University[]>(`${url}/universities`, revision),
        ]);
        if (controller.signal.aborted) return;
        commit({
          status: "ready",
          property,
          media: media.status === "fulfilled" ? media.value : [],
          universities: universities.status === "fulfilled" ? universities.value : [],
          mediaError: media.status === "rejected",
          universityError: universities.status === "rejected",
        });
        // Tracking is best effort and independently checks effective visibility in SQL.
        void fetch(`${url}/view`, {
          method: "POST",
          credentials: "same-origin",
          keepalive: true,
        }).catch(() => {});
      } catch {
        commit({ status: "error" });
      }
    }
    void load();
    return () => controller.abort();
  }, [propertyId, revision]);
  const state = result?.id === propertyId && result.revision === revision ? result.state : null;
  const retry = () => setRevision((value) => value + 1);
  if (!state)
    return (
      <main className={styles.page}>
        <div className={styles.container} role="status">
          <span className="sr-only">Loading property details…</span>
          <div className={`${styles.skeleton} motion-safe:animate-pulse`} />
          <div className={`${styles.skeleton} motion-safe:animate-pulse`} />
        </div>
      </main>
    );
  if (state.status !== "ready")
    return (
      <main className={styles.page}>
        <div className={`${styles.container} ${styles.state}`}>
          <h1>
            {state.status === "not-found" ? "Property not found" : "We couldn’t load this property"}
          </h1>
          <p className={styles.muted}>
            {state.status === "not-found"
              ? "This listing may have been removed or is not available yet."
              : "Please try again in a moment."}
          </p>
          {state.status === "error" && (
            <button type="button" onClick={retry} className={styles.retry}>
              Try again
            </button>
          )}
          <div>
            <Link href="/properties" className={styles.textLink}>
              Browse properties
            </Link>
          </div>
        </div>
      </main>
    );
  return <PropertyDetailsContent key={propertyId} {...state} onRetry={retry} />;
}

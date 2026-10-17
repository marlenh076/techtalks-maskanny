import type { Property } from "../models/property.model";
import type { PropertyBoosting } from "@/src/features/boosting/models/property_boosting.model";
import type { Media } from "../models/media.model";
import type { University } from "@/src/features/universities/models/university.model";

export interface HostListing {
  property: Property;
  boost: PropertyBoosting | null;
  media: Media[];
  universities: University[];
  relatedData: {
    boost: "loaded" | "unavailable";
    media: "loaded" | "unavailable";
    universities: "loaded" | "unavailable";
  };
}

export function propertyFeatureLabels(
  property: Partial<
    Pick<Property, "furnished" | "electricity_included" | "kitchen_type" | "bathroom_type">
  >,
): string[] {
  const features: string[] = [];
  if (typeof property.furnished === "boolean") {
    features.push(property.furnished ? "Furnished" : "Unfurnished");
  }
  if (typeof property.electricity_included === "boolean") {
    features.push(
      property.electricity_included ? "Electricity included" : "Electricity not included",
    );
  }
  if (property.kitchen_type === "private" || property.kitchen_type === "shared") {
    features.push(`${property.kitchen_type === "private" ? "Private" : "Shared"} kitchen`);
  }
  if (property.bathroom_type === "private" || property.bathroom_type === "shared") {
    features.push(`${property.bathroom_type === "private" ? "Private" : "Shared"} bathroom`);
  }
  return features;
}

export function isLive(
  listing: Pick<HostListing, "property" | "boost">,
  now = Date.now(),
): boolean {
  const { property, boost } = listing;
  return (
    property.approval_status === "approved" &&
    boost?.status === "active" &&
    boost.is_paid === true &&
    boost.start_date !== null &&
    boost.end_date !== null &&
    Date.parse(boost.start_date) <= now &&
    now < Date.parse(boost.end_date)
  );
}

export function canRequestBoost(
  listing: Pick<HostListing, "property" | "boost"> & { relatedData?: HostListing["relatedData"] },
): boolean {
  return (
    listing.property.approval_status === "approved" &&
    listing.boost === null &&
    listing.relatedData?.boost !== "unavailable"
  );
}

export function coverImage(media: Media[]): string | null {
  return (
    [...media]
      .filter((item) => item.type === "image")
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0]?.url ?? null
  );
}

export function boostHref(propertyId: string): string {
  return `/owner/BoostingPlan?property_id=${encodeURIComponent(propertyId)}`;
}

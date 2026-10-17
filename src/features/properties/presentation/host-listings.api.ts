import type { Property } from "../models/property.model";
import type { PropertyBoosting } from "@/src/features/boosting/models/property_boosting.model";
import type { Media } from "../models/media.model";
import type { University } from "@/src/features/universities/models/university.model";
import type { HostListing } from "./host-listings";

export async function hostRequest<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}`, ...init?.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      typeof body.error === "string" ? body.error : `Request failed (${response.status})`,
    );
  }
  return response.json() as Promise<T>;
}

export async function loadHostListings(token: string): Promise<HostListing[]> {
  const properties = await hostRequest<Property[]>("/api/host/properties", token);
  return Promise.all(
    properties.map(async (property) => {
      const id = encodeURIComponent(property.property_id);
      const [boostResult, mediaResult, universityResult] = await Promise.allSettled([
        hostRequest<PropertyBoosting | null>(`/api/properties/${id}/boosting`, token),
        hostRequest<Media[]>(`/api/properties/${id}/media`, token),
        hostRequest<University[]>(`/api/properties/${id}/universities`, token),
      ]);
      return {
        property,
        boost: boostResult.status === "fulfilled" ? boostResult.value : null,
        media: mediaResult.status === "fulfilled" ? mediaResult.value : [],
        universities: universityResult.status === "fulfilled" ? universityResult.value : [],
        relatedData: {
          boost: boostResult.status === "fulfilled" ? "loaded" : "unavailable",
          media: mediaResult.status === "fulfilled" ? "loaded" : "unavailable",
          universities: universityResult.status === "fulfilled" ? "loaded" : "unavailable",
        },
      };
    }),
  );
}

import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, getCurrentUser } from "@/src/lib/supabase/auth";
import { HostRepository } from "@/src/features/users/repository/host.repository";
import { PropertyRepository } from "@/src/features/properties/repository/property.repository";
import { PropertyService } from "@/src/features/properties/service/property";
import { PropertyBoostingRepository } from "@/src/features/boosting/repository/property_boosting.repository";
import { MediaRepository } from "@/src/features/properties/repository/media.repository";
import { PropertyUniversityRepository } from "@/src/features/properties/repository/property_universities.repository";
import type { HostListing } from "@/src/features/properties/presentation/host-listings";
import type { Media } from "@/src/features/properties/models/media.model";
import type { University } from "@/src/features/universities/models/university.model";

export async function GET(request: NextRequest) {
  try {
    const token = getAccessToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const host = await new HostRepository(token).getByUserId(user.id);
    if (!host) {
      return NextResponse.json({ error: "Host access required" }, { status: 403 });
    }

    const properties = await new PropertyService(new PropertyRepository(token)).getByHostId(
      host.host_id,
    );
    if (request.nextUrl.searchParams.get("include") !== "related") {
      return NextResponse.json(properties);
    }

    // The dashboard already owns these properties. Resolve related data after
    // one authorization check instead of repeating auth and ownership queries
    // in three separate HTTP requests for every property.
    const boosts = new PropertyBoostingRepository(token);
    const media = new MediaRepository(token);
    const universities = new PropertyUniversityRepository(token);
    const propertyIds = properties.map((property) => property.property_id);
    const boostResults = Promise.allSettled(
      properties.map((property) => boosts.getCurrentByPropertyId(property.property_id)),
    );
    const [mediaBatch, universityBatch] = await Promise.allSettled([
      media.getByPropertyIds(propertyIds),
      universities.getUniversitiesByPropertyIds(propertyIds),
    ]);
    const mediaByProperty = new Map<string, Media[]>();
    if (mediaBatch.status === "fulfilled") {
      for (const item of mediaBatch.value) {
        const entries = mediaByProperty.get(item.property_id) ?? [];
        entries.push(item);
        mediaByProperty.set(item.property_id, entries);
      }
    }
    const universitiesByProperty = new Map<string, University[]>();
    if (universityBatch.status === "fulfilled") {
      for (const item of universityBatch.value) {
        const entries = universitiesByProperty.get(item.property_id) ?? [];
        entries.push(item.university);
        universitiesByProperty.set(item.property_id, entries);
      }
    }
    const resolvedBoosts = await boostResults;
    const listings: HostListing[] = await Promise.all(
      properties.map(async (property, index) => {
        const [mediaResult, universityResult] = await Promise.allSettled([
          mediaBatch.status === "fulfilled"
            ? (mediaByProperty.get(property.property_id) ?? [])
            : media.getByPropertyId(property.property_id),
          universityBatch.status === "fulfilled"
            ? (universitiesByProperty.get(property.property_id) ?? [])
            : universities.getUniversitiesByPropertyId(property.property_id),
        ]);
        const boostResult = resolvedBoosts[index];
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
    return NextResponse.json(listings, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch host properties" }, { status: 500 });
  }
}

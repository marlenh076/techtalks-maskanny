import { supabase, createAuthenticatedClient } from "../../../lib/supabase/client";
import { Property, PropertyCreate } from "../models/property.model";
import { IPropertyRepository, PropertyFilters } from "./IProperty.repository";
import { inFlight } from "@/src/lib/in-flight";

type PropertyWithImages = Property & { media: { url: string }[] };

// Temporary, process-local diagnostics for the public listings RPC.
const activationRpcDiagnostics = { attempts: 0, successes: 0, failures: 0 };
const activationRequests = new Map<
  string,
  Promise<{ property_id: string; activated_at: string }[]>
>();

function fetchCause(details: string | undefined) {
  // Postgrest-js places the original fetch cause here when status is 0.
  // Extract only its type and error code; the raw details may contain URLs.
  const cause = details?.match(/^Caused by: ([A-Za-z]+):[^\r\n]*?(?: \(([A-Z][A-Z0-9_]+)\))?\r?$/m);
  return cause ? { name: cause[1], code: cause[2] ?? null } : null;
}

export class PropertyUnavailableError extends Error {
  constructor() {
    super("Property not found or access denied");
  }
}

export class PropertyRepository implements IPropertyRepository {
  private supabase;

  constructor(accessToken?: string) {
    this.supabase = accessToken ? createAuthenticatedClient(accessToken) : supabase;
  }

  async create(data: PropertyCreate & { property_id?: string }): Promise<Property> {
    const { data: property, error } = await this.supabase
      .from("property")
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return property;
  }

  async update(id: string, data: Partial<Property>): Promise<Property> {
    const { data: property, error } = await this.supabase
      .from("property")
      .update(data)
      .eq("property_id", id)
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!property) {
      throw new PropertyUnavailableError();
    }

    return property;
  }

  async delete(id: string): Promise<void> {
    const { data, error } = await this.supabase.rpc("archive_host_property", {
      p_property_id: id,
    });
    if (error) throw new Error(error.message);
    if (!data || data.property_id !== id || !data.archived_at) {
      throw new PropertyUnavailableError();
    }
  }

  async getAll(): Promise<Property[]> {
    const { data, error } = await this.supabase.from("property").select("*");

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getByHostId(hostId: string): Promise<Property[]> {
    const { data, error } = await this.supabase
      .from("property")
      .select("*")
      .eq("host_id", hostId)
      .is("archived_at", null);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getById(id: string): Promise<Property | null> {
    const { data, error } = await this.supabase
      .from("property")
      .select("*")
      .eq("property_id", id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getPublicLiveBoostActivationTimes(): Promise<
    { property_id: string; activated_at: string }[]
  > {
    return inFlight(activationRequests, "public", () => this.loadPublicLiveBoostActivationTimes());
  }

  private async loadPublicLiveBoostActivationTimes(): Promise<
    { property_id: string; activated_at: string }[]
  > {
    const startedAt = performance.now();
    const attempt = ++activationRpcDiagnostics.attempts;
    const { data, error, status } = await this.supabase.rpc("public_live_boost_activation_times");
    const elapsedMs = Math.round(performance.now() - startedAt);
    if (error) {
      activationRpcDiagnostics.failures++;
      if (typeof window === "undefined") {
        console.error(
          "[public_live_boost_activation_times] RPC failed " +
            JSON.stringify({
              attempt,
              elapsedMs,
              status,
              errorCode: error.code || null,
              fetchCause: status === 0 ? fetchCause(error.details) : null,
              successes: activationRpcDiagnostics.successes,
              failures: activationRpcDiagnostics.failures,
              intermittentObserved: activationRpcDiagnostics.successes > 0,
            }),
        );
      }
      throw new Error(error.message);
    }
    activationRpcDiagnostics.successes++;
    if (typeof window === "undefined") {
      console.info(
        "[public_live_boost_activation_times] RPC succeeded " +
          JSON.stringify({
            attempt,
            elapsedMs,
            status,
            successes: activationRpcDiagnostics.successes,
            failures: activationRpcDiagnostics.failures,
            intermittentObserved: activationRpcDiagnostics.failures > 0,
          }),
      );
    }
    return data ?? [];
  }

  async search(filters: PropertyFilters): Promise<Property[]>;
  async search(filters: PropertyFilters, withImages: true): Promise<PropertyWithImages[]>;
  async search(
    filters: PropertyFilters,
    withImages = false,
  ): Promise<Property[] | PropertyWithImages[]> {
    let query = this.supabase
      .from("property")
      .select(withImages ? "*,media(url)" : "*")
      .is("archived_at", null);
    if (withImages) {
      // The embedded relation keeps the property read and thumbnail lookup in
      // one RLS-protected request. Its order matches the former media query.
      query = query
        .eq("media.type", "image")
        .order("sort_order", { referencedTable: "media", ascending: true })
        .order("media_id", { referencedTable: "media", ascending: true });
    }

    if (filters.university_id) {
      // Use the same client and RLS as the property search. An empty association
      // must return no results, never fall back to unrelated properties.
      const { data: associations, error } = await this.supabase
        .from("property_university")
        .select("property_id")
        .eq("university_id", filters.university_id);
      if (error) throw new Error(error.message);
      const propertyIds = [...new Set(associations.map((item) => item.property_id))];
      if (!propertyIds.length) return [];
      query = query.in("property_id", propertyIds);
    }

    if (filters.query) {
      const searchQuery = filters.query.replace(/[(),]/g, " ").trim();

      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`,
        );
      }
    }

    if (filters.property_type) {
      query = query.eq("property_type", filters.property_type);
    }

    if (filters.min_price !== undefined) {
      query = query.gte("price", filters.min_price);
    }

    if (filters.max_price !== undefined) {
      query = query.lte("price", filters.max_price);
    }

    if (filters.bedrooms !== undefined) {
      query = query.eq("bedrooms", filters.bedrooms);
    }

    if (filters.bathrooms !== undefined) {
      query = query.eq("bathrooms", filters.bathrooms);
    }

    if (filters.furnished !== undefined) {
      query = query.eq("furnished", filters.furnished);
    }

    if (filters.electricity_included !== undefined) {
      query = query.eq("electricity_included", filters.electricity_included);
    }

    if (filters.gender) {
      query = query.eq("gender", filters.gender);
    }

    // Order before Supabase applies its response row limit, so recent listings
    // cannot be omitted from the result window. Keep ties deterministic too.
    const { data: properties, error } = await query
      .order("created_at", { ascending: false })
      .order("property_id", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    // Supabase's type-level select parser cannot resolve a conditional column string.
    return properties as unknown as Property[] | PropertyWithImages[];
  }
}

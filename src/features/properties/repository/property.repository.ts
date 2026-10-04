import {
  supabase,
  createAuthenticatedClient,
} from "../../../lib/supabase/client";
import { Property, PropertyCreate } from "../models/property.model";
import { IPropertyRepository, PropertyFilters } from "./IProperty.repository";

export class PropertyUnavailableError extends Error {
  constructor() {
    super("Property not found or access denied");
  }
}

export class PropertyRepository implements IPropertyRepository {
  private supabase;

  constructor(accessToken?: string) {
    this.supabase = accessToken
      ? createAuthenticatedClient(accessToken)
      : supabase;
  }

  async create(data: PropertyCreate): Promise<Property> {
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
    const { data: property, error } = await this.supabase
      .from("property")
      .delete()
      .eq("property_id", id)
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!property) {
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
      .eq("host_id", hostId);

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

  async search(filters: PropertyFilters): Promise<Property[]> {
    let query = this.supabase.from("property").select("*");

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

    const { data: properties, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return properties;
  }
}

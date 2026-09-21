import { supabase } from "../../../lib/supabase/client";
import { Property } from "../models/property.model";
import { IPropertyRepository } from "./IProperty.repository";
import { PropertyFilters } from "./IProperty.repository";

export class PropertyRepository implements IPropertyRepository {
  async create(
    data: Omit<Property, "property_id" | "created_at">,
  ): Promise<Property> {
    const { data: property, error } = await supabase
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
    const { data: property, error } = await supabase
      .from("property")
      .update(data)
      .eq("property_id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return property;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("property")
      .delete()
      .eq("property_id", id);

    if (error) {
      throw new Error(error.message);
    }
  }

  async getAll(): Promise<Property[]> {
    const { data, error } = await supabase.from("property").select("*");

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getById(id: string): Promise<Property | null> {
    const { data, error } = await supabase
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
    let query = supabase.from("property").select("*");

    if (filters.query) {
      query = query.or(
        `title.ilike.%${filters.query}%,description.ilike.%${filters.query}%,address.ilike.%${filters.query}%`,
      );
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

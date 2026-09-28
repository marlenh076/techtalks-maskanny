import { SupabaseClient } from "@supabase/supabase-js";
import {
  supabase,
  createAuthenticatedClient,
} from "../../../lib/supabase/client";
import { PropertyBoosting } from "../models/property_boosting.model";
import { IPropertyBoostingRepository } from "./IPropertyBoosting.repository";

export class PropertyBoostingConflictError extends Error {
  constructor() {
    super("Property already has a boost");
  }
}

export class PropertyBoostingRepository implements IPropertyBoostingRepository {
  private supabase: SupabaseClient;

  constructor(accessToken?: string) {
    this.supabase = accessToken
      ? createAuthenticatedClient(accessToken)
      : supabase;
  }

  async create(
    data: Omit<PropertyBoosting, "property_boosting_id">,
  ): Promise<PropertyBoosting> {
    const { data: propertyBoosting, error } = await this.supabase
      .from("property_boosting")
      .insert(data)
      .select()
      .single();

    if (error) {
      if (
        error.code === "23505" &&
        error.message.includes("property_boosting_property_id_key")
      ) {
        throw new PropertyBoostingConflictError();
      }

      throw new Error(error.message);
    }

    return propertyBoosting;
  }

  async getById(id: string): Promise<PropertyBoosting | null> {
    const { data: propertyBoosting, error } = await this.supabase
      .from("property_boosting")
      .select("*")
      .eq("property_boosting_id", id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return propertyBoosting;
  }

  async getAll(): Promise<PropertyBoosting[]> {
    const { data: propertyBoostings, error } = await this.supabase
      .from("property_boosting")
      .select("*");

    if (error) {
      throw new Error(error.message);
    }

    return propertyBoostings;
  }

  async getByPropertyId(propertyId: string): Promise<PropertyBoosting | null> {
    const { data, error } = await this.supabase
      .from("property_boosting")
      .select("*")
      .eq("property_id", propertyId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async update(
    id: string,
    data: Partial<PropertyBoosting>,
  ): Promise<PropertyBoosting> {
    const { data: propertyBoosting, error } = await this.supabase
      .from("property_boosting")
      .update(data)
      .eq("property_boosting_id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return propertyBoosting;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("property_boosting")
      .delete()
      .eq("property_boosting_id", id);

    if (error) {
      throw new Error(error.message);
    }
  }
}

import { SupabaseClient } from "@supabase/supabase-js";
import { supabase, createAuthenticatedClient } from "../../../lib/supabase/client";
import { PropertyBoosting, PropertyBoostingCreate } from "../models/property_boosting.model";
import { IPropertyBoostingRepository } from "./IPropertyBoosting.repository";

export class PropertyBoostingRequestError extends Error {
  constructor(
    message: string,
    readonly status: 403 | 404 | 409,
  ) {
    super(message);
  }
}

export class PropertyBoostingRepository implements IPropertyBoostingRepository {
  private supabase: SupabaseClient;

  constructor(accessToken?: string) {
    this.supabase = accessToken ? createAuthenticatedClient(accessToken) : supabase;
  }

  async create(data: PropertyBoostingCreate): Promise<PropertyBoosting> {
    const { data: propertyBoosting, error } = await this.supabase.rpc("request_property_boost", {
      p_property_id: data.property_id,
      p_boosting_plan_id: data.boosting_plan_id,
    });

    if (error) {
      switch (error.code) {
        case "42501":
        case "M4030":
          throw new PropertyBoostingRequestError("Forbidden", 403);
        case "M4040":
          throw new PropertyBoostingRequestError("Property not found", 404);
        case "M4041":
          throw new PropertyBoostingRequestError("Boosting plan not found", 404);
        case "M4090":
          throw new PropertyBoostingRequestError("Property already has a current boost", 409);
        case "M4091":
          throw new PropertyBoostingRequestError(
            "Property must be approved before requesting a boost",
            409,
          );
        case "M4092":
          throw new PropertyBoostingRequestError(
            "Boosting plan currency, price or duration needs configuration",
            409,
          );
      }

      if (
        error.code === "23505" &&
        error.message.includes("property_boosting_one_current_per_property_idx")
      ) {
        throw new PropertyBoostingRequestError("Property already has a current boost", 409);
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

  async getCurrentByPropertyId(propertyId: string): Promise<PropertyBoosting | null> {
    const { data, error } = await this.supabase.rpc("get_current_property_boost", {
      p_property_id: propertyId,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data?.[0] ?? null;
  }

  async delete(id: string): Promise<void> {
    const { data, error } = await this.supabase
      .from("property_boosting")
      .delete()
      .eq("property_boosting_id", id)
      .select("property_boosting_id")
      .maybeSingle();

    if (error) {
      if (error.code === "23503" || error.code === "40P01") {
        throw new PropertyBoostingRequestError(
          "Payment history prevents deletion; refresh the boost request",
          409,
        );
      }
      throw new Error(error.message);
    }

    if (!data) {
      throw new PropertyBoostingRequestError(
        "Boost cannot be deleted in its current state; payment history is retained",
        409,
      );
    }
  }
}

import { University } from "@/src/features/universities/models/university.model";
import { createAuthenticatedClient, supabase } from "@/src/lib/supabase/client";
import { Property } from "../models/property.model";

export interface IPropertyUniversityRepository {
  getUniversitiesByPropertyId(propertyId: string): Promise<University[]>;
  getPropertiesByUniversityId(universityId: string): Promise<Property[]>;
  associate(propertyId: string, universityIds: string[]): Promise<void>;
  replace(propertyId: string, universityIds: string[]): Promise<string[]>;
}

export class PropertyUniversityRepository implements IPropertyUniversityRepository {
  private readonly client;

  constructor(accessToken?: string) {
    this.client = accessToken ? createAuthenticatedClient(accessToken) : supabase;
  }

  async associate(propertyId: string, universityIds: string[]): Promise<void> {
    if (!universityIds.length) return;
    // Composite PK already exists. DO NOTHING makes concurrent/lost-response
    // retries safe without requiring UPDATE permission or replacing links.
    const { error } = await this.client.from("property_university").upsert(
      [...new Set(universityIds)].map((university_id) => ({
        property_id: propertyId,
        university_id,
      })),
      { onConflict: "property_id,university_id", ignoreDuplicates: true },
    );
    if (error) throw new Error(error.message);
  }

  async replace(propertyId: string, universityIds: string[]): Promise<string[]> {
    const { data, error } = await this.client.rpc("replace_host_property_universities", {
      p_property_id: propertyId,
      p_university_ids: universityIds,
    });
    if (error) {
      if (error.code === "42501")
        throw new Error("You can only update universities for your own active property.");
      if (error.code === "22023" || error.code === "23503")
        throw new Error("One or more selected universities are invalid.");
      throw new Error("Could not save university associations.");
    }
    return data ?? [];
  }

  async getUniversitiesByPropertyId(propertyId: string): Promise<University[]> {
    const { data, error } = await this.client
      .from("property_university")
      .select("university(*)")
      .eq("property_id", propertyId);

    if (error) {
      throw new Error(error.message);
    }

    return data.map((item) => item.university);
  }

  async getUniversitiesByPropertyIds(
    propertyIds: string[],
  ): Promise<{ property_id: string; university: University }[]> {
    if (propertyIds.length === 0) return [];
    const { data, error } = await this.client
      .from("property_university")
      .select("property_id,university(*)")
      .in("property_id", propertyIds);
    if (error) throw new Error(error.message);
    return data;
  }

  async getPropertiesByUniversityId(universityId: string): Promise<Property[]> {
    const { data, error } = await this.client
      .from("property_university")
      .select("property(*)")
      .eq("university_id", universityId);

    if (error) {
      throw new Error(error.message);
    }

    return data.map((item) => item.property);
  }
}

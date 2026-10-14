import { University } from "@/src/features/universities/models/university.model";
import { createAuthenticatedClient, supabase } from "@/src/lib/supabase/client";
import { Property } from "../models/property.model";

export interface IPropertyUniversityRepository {
  getUniversitiesByPropertyId(propertyId: string): Promise<University[]>;
  getPropertiesByUniversityId(universityId: string): Promise<Property[]>;
  associate(propertyId: string, universityIds: string[]): Promise<void>;
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

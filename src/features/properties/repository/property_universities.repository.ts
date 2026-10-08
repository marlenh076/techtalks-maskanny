import { University } from "@/src/features/universities/models/university.model";
import { createAuthenticatedClient, supabase } from "@/src/lib/supabase/client";
import { Property } from "../models/property.model";

export interface IPropertyUniversityRepository {
  getUniversitiesByPropertyId(propertyId: string): Promise<University[]>;
  getPropertiesByUniversityId(universityId: string): Promise<Property[]>;
}

export class PropertyUniversityRepository implements IPropertyUniversityRepository {
  private readonly client;

  constructor(accessToken?: string) {
    this.client = accessToken ? createAuthenticatedClient(accessToken) : supabase;
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

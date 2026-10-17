import { supabase } from "../../../lib/supabase/client";
import { University } from "../models/university.model";
import { IUniversityRepository, UniversityFilters } from "./IUniversity.repository";

export class UniversityRepository implements IUniversityRepository {
  async getById(id: string): Promise<University | null> {
    const { data: university, error } = await supabase
      .from("university")
      .select("*")
      .eq("university_id", id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return university;
  }

  async getAll(): Promise<University[]> {
    const { data: universities, error } = await supabase.from("university").select("*");

    if (error) {
      throw new Error(error.message);
    }

    return universities;
  }

  async search(filters: UniversityFilters): Promise<University[]> {
    let query = supabase.from("university").select("*");

    if (filters.query) {
      const searchQuery = filters.query.replace(/[(),]/g, " ").trim();

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`);
      }
    }

    if (filters.city) {
      query = query.eq("city", filters.city);
    }

    const { data: universities, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return universities;
  }
}

import { Property, PropertyCreate } from "../models/property.model";
import { ICreateRepository } from "@/src/shared/repositories/create.repository";
import { IReadRepository } from "@/src/shared/repositories/read.repository";
import { IUpdateRepository } from "@/src/shared/repositories/update.repository";
import { IDeleteRepository } from "@/src/shared/repositories/delete.repository";
import { ISearchRepository } from "@/src/shared/repositories/search.repository";

export interface PropertyFilters {
  query?: string;
  property_type?: "dorm" | "studio" | "apartment";
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnished?: boolean;
  electricity_included?: boolean;
  gender?: "boys" | "girls" | "mixed";
}

export interface IPropertyRepository
  extends
    ICreateRepository<Property, PropertyCreate>,
    IReadRepository<Property>,
    IUpdateRepository<Property>,
    IDeleteRepository,
    ISearchRepository<Property, PropertyFilters> {
  getByHostId(hostId: string): Promise<Property[]>;
}

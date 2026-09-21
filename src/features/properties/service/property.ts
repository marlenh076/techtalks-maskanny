import { Property } from "../models/property.model";
import {
  IPropertyRepository,
  PropertyFilters,
} from "../repository/IProperty.repository";

export class PropertyService {
  constructor(private propertyRepository: IPropertyRepository) {}

  async create(
    data: Omit<Property, "property_id" | "created_at">,
  ): Promise<Property> {
    return this.propertyRepository.create(data);
  }

  async getById(id: string): Promise<Property | null> {
    return this.propertyRepository.getById(id);
  }

  async getAll(): Promise<Property[]> {
    return this.propertyRepository.getAll();
  }

  async update(id: string, data: Partial<Property>): Promise<Property> {
    return this.propertyRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.propertyRepository.delete(id);
  }

  async search(filters: PropertyFilters): Promise<Property[]> {
    return this.propertyRepository.search(filters);
  }
}

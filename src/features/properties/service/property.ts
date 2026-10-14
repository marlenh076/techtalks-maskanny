import { Property, PropertyCreate } from "../models/property.model";
import {
  IPropertyRepository,
  PropertyFilters,
} from "../repository/IProperty.repository";

export class PropertyService {
  constructor(private propertyRepository: IPropertyRepository) {}

  async create(data: PropertyCreate & { property_id?: string }): Promise<Property> {
    return this.propertyRepository.create(data);
  }

  async getById(id: string): Promise<Property | null> {
    return this.propertyRepository.getById(id);
  }

  async getAll(): Promise<Property[]> {
    return this.propertyRepository.getAll();
  }

  async getByHostId(hostId: string): Promise<Property[]> {
    return this.propertyRepository.getByHostId(hostId);
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

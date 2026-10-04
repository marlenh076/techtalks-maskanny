import {
  PropertyBoosting,
  PropertyBoostingCreate,
} from "../models/property_boosting.model";
import { IPropertyBoostingRepository } from "../repository/IPropertyBoosting.repository";

export class PropertyBoostingService {
  constructor(
    private propertyBoostingRepository: IPropertyBoostingRepository,
  ) {}

  async create(data: PropertyBoostingCreate): Promise<PropertyBoosting> {
    return this.propertyBoostingRepository.create(data);
  }

  async getById(id: string): Promise<PropertyBoosting | null> {
    return this.propertyBoostingRepository.getById(id);
  }

  async getCurrentByPropertyId(propertyId: string): Promise<PropertyBoosting | null> {
    return this.propertyBoostingRepository.getCurrentByPropertyId(propertyId);
  }

  async getAll(): Promise<PropertyBoosting[]> {
    return this.propertyBoostingRepository.getAll();
  }

  async delete(id: string): Promise<void> {
    return this.propertyBoostingRepository.delete(id);
  }
}

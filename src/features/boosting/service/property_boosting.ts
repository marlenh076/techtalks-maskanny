import { PropertyBoosting } from "../models/property_boosting.model";
import { IPropertyBoostingRepository } from "../repository/IPropertyBoosting.repository";

export class PropertyBoostingService {
  constructor(
    private propertyBoostingRepository: IPropertyBoostingRepository,
  ) {}

  async create(
    data: Omit<PropertyBoosting, "property_boosting_id">,
  ): Promise<PropertyBoosting> {
    return this.propertyBoostingRepository.create(data);
  }

  async getById(id: string): Promise<PropertyBoosting | null> {
    return this.propertyBoostingRepository.getById(id);
  }

  async getByPropertyId(propertyId: string): Promise<PropertyBoosting | null> {
    return this.propertyBoostingRepository.getByPropertyId(propertyId);
  }

  async getAll(): Promise<PropertyBoosting[]> {
    return this.propertyBoostingRepository.getAll();
  }

  async update(
    id: string,
    data: Partial<PropertyBoosting>,
  ): Promise<PropertyBoosting> {
    return this.propertyBoostingRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.propertyBoostingRepository.delete(id);
  }
}

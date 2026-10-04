import { PropertyModerationRepository } from "../repository/property_moderation.repository";

export class PropertyModerationService {
  constructor(private readonly repository: PropertyModerationRepository) {}

  approve(propertyId: string): Promise<void> {
    return this.repository.approve(propertyId);
  }

  reject(propertyId: string): Promise<void> {
    return this.repository.reject(propertyId);
  }
}

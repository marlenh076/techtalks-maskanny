import { PropertyModerationRepository } from "../repository/property_moderation.repository";

export class PropertyModerationService {
  constructor(private readonly repository: PropertyModerationRepository) {}

  approve(propertyId: string, reason?: string): Promise<void> {
    return this.repository.approve(propertyId, reason);
  }

  reject(propertyId: string, reason: string): Promise<void> {
    return this.repository.reject(propertyId, reason);
  }
}

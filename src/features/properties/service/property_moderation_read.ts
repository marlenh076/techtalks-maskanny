import {
  ModerationPropertyDetails,
  ModerationPropertySummary,
  ModerationStatus,
} from "../models/property_moderation.model";
import { PropertyModerationReadRepository } from "../repository/property_moderation_read.repository";

export class PropertyModerationReadService {
  constructor(private readonly repository: PropertyModerationReadRepository) {}

  list(status: ModerationStatus): Promise<ModerationPropertySummary[]> {
    return this.repository.list(status);
  }

  getById(propertyId: string): Promise<ModerationPropertyDetails | null> {
    return this.repository.getById(propertyId);
  }
}

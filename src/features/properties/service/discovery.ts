import { Property } from "../models/property.model";
import { PropertyFilters } from "../repository/IProperty.repository";
import { PropertyRepository } from "../repository/property.repository";

export type PropertyListing = Property & {
  thumbnail_url: string | null;
  boost_activated_at: string;
};

export class PropertyDiscoveryService {
  constructor(private properties: PropertyRepository) {}

  async search(filters: PropertyFilters): Promise<PropertyListing[]> {
    const [properties, activations] = await Promise.all([
      this.properties.search(filters, true),
      this.properties.getPublicLiveBoostActivationTimes(),
    ]);
    const activationByPropertyId = new Map(
      activations.map(({ property_id, activated_at }) => [property_id, activated_at]),
    );
    const visible = properties.filter(
      (property) =>
        property.approval_status === "approved" && activationByPropertyId.has(property.property_id),
    );
    return visible.map(({ media, ...property }) => ({
      ...property,
      thumbnail_url: media[0]?.url ?? null,
      boost_activated_at: activationByPropertyId.get(property.property_id)!,
    }));
  }
}

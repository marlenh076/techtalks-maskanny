import { Property } from "../models/property.model";
import { PropertyFilters } from "../repository/IProperty.repository";
import { PropertyRepository } from "../repository/property.repository";
import { MediaRepository } from "../repository/media.repository";

export type PropertyListing = Property & {
  thumbnail_url: string | null;
  boost_activated_at: string;
};

export class PropertyDiscoveryService {
  constructor(
    private properties: PropertyRepository,
    private media: MediaRepository,
  ) {}

  async search(filters: PropertyFilters): Promise<PropertyListing[]> {
    const [properties, activations] = await Promise.all([
      this.properties.search(filters),
      this.properties.getPublicLiveBoostActivationTimes(),
    ]);
    const activationByPropertyId = new Map(
      activations.map(({ property_id, activated_at }) => [property_id, activated_at]),
    );
    const visible = properties.filter(
      (property) =>
        property.approval_status === "approved" && activationByPropertyId.has(property.property_id),
    );
    const images = await this.media.getImagesByPropertyIds(
      visible.map((property) => property.property_id),
    );
    const thumbnails = new Map<string, string>();
    for (const image of images) {
      if (!thumbnails.has(image.property_id)) {
        thumbnails.set(image.property_id, image.url);
      }
    }
    return visible.map((property) => ({
      ...property,
      thumbnail_url: thumbnails.get(property.property_id) ?? null,
      boost_activated_at: activationByPropertyId.get(property.property_id)!,
    }));
  }
}

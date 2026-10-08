import { Property } from "../models/property.model";
import { PropertyFilters } from "../repository/IProperty.repository";
import { PropertyRepository } from "../repository/property.repository";
import { MediaRepository } from "../repository/media.repository";

export type PropertyListing = Property & { thumbnail_url: string | null };

export class PropertyDiscoveryService {
  constructor(
    private properties: PropertyRepository,
    private media: MediaRepository,
  ) {}

  async search(filters: PropertyFilters): Promise<PropertyListing[]> {
    const properties = await this.properties.search(filters);
    const visible = properties.filter((property) => property.approval_status === "approved");
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
    }));
  }
}

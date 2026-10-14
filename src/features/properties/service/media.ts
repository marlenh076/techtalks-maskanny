import { Media } from "../models/media.model";
import { IMediaRepository } from "../repository/IMedia.repository";
import { MediaLimitError, MediaUnavailableError } from "../repository/media.repository";

export { MediaLimitError } from "../repository/media.repository";

import { MAX_PROPERTY_IMAGES } from "../validation/media-limits";
const MAX_VIDEOS = 1;

export class MediaService {
  constructor(private mediaRepository: IMediaRepository) {}

  async assertWithinLimit(
    propertyId: string,
    type: Media["type"],
    excludeMediaId?: string,
  ): Promise<void> {
    const existingMedia = await this.mediaRepository.getByPropertyId(propertyId);
    const count = existingMedia.filter(
      (media) => media.type === type && media.media_id !== excludeMediaId,
    ).length;

    if (type === "image" && count >= MAX_PROPERTY_IMAGES) {
      throw new MediaLimitError("Maximum number of images reached");
    }

    if (type === "video" && count >= MAX_VIDEOS) {
      throw new MediaLimitError("Only one video is allowed per property");
    }
  }

  async create(data: Omit<Media, "media_id" | "created_at"> & { media_id?: string }): Promise<Media> {
    await this.assertWithinLimit(data.property_id, data.type);
    return this.mediaRepository.create(data);
  }

  async getById(id: string): Promise<Media | null> {
    return this.mediaRepository.getById(id);
  }

  async getAll(): Promise<Media[]> {
    return this.mediaRepository.getAll();
  }

  async getByPropertyId(propertyId: string): Promise<Media[]> {
    return this.mediaRepository.getByPropertyId(propertyId);
  }

  async update(id: string, data: Partial<Media>): Promise<Media> {
    if (data.type) {
      const existingMedia = await this.mediaRepository.getById(id);
      if (!existingMedia) throw new MediaUnavailableError();
      await this.assertWithinLimit(existingMedia.property_id, data.type, id);
    }

    return this.mediaRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.mediaRepository.delete(id);
  }
}

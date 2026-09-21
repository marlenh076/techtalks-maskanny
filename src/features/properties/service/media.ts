import { BoostingPlanService } from "../../boosting/service/boosting_plan";
import { PropertyBoostingService } from "../../boosting/service/property_boosting";
import { Media } from "../models/media.model";
import { IMediaRepository } from "../repository/IMedia.repository";

export class MediaService {
  constructor(
    private mediaRepository: IMediaRepository,
    private propertyBoostingService: PropertyBoostingService,
    private boostingPlanService: BoostingPlanService,
  ) {}

  async create(data: Omit<Media, "media_id" | "created_at">): Promise<Media> {
    const boosting = await this.propertyBoostingService.getByPropertyId(
      data.property_id,
    );

    if (!boosting || boosting.status !== "active") {
      throw new Error("Property does not have an active boosting plan");
    }

    const plan = await this.boostingPlanService.getById(
      boosting.boosting_plan_id,
    );

    if (!plan) {
      throw new Error("Boosting plan not found");
    }

    const existingMedia = await this.mediaRepository.getByPropertyId(
      data.property_id,
    );

    if (data.type === "image") {
      const imageCount = existingMedia.filter(
        (media) => media.type === "image",
      ).length;

      if (imageCount >= plan.max_images) {
        throw new Error("Maximum number of images reached");
      }
    }

    if (data.type === "video") {
      if (!plan.video_enabled) {
        throw new Error("Video is not allowed with this boosting plan");
      }

      const videoCount = existingMedia.filter(
        (media) => media.type === "video",
      ).length;

      if (videoCount >= 1) {
        throw new Error("Only one video is allowed per property");
      }
    }

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
    return this.mediaRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.mediaRepository.delete(id);
  }
}

import { Media } from "../models/media.model";
import { ICreateRepository } from "../../../shared/repositories/create.repository";
import { IReadRepository } from "../../../shared/repositories/read.repository";
import { IUpdateRepository } from "../../../shared/repositories/update.repository";
import { IDeleteRepository } from "../../../shared/repositories/delete.repository";

export interface IMediaRepository
  extends
    ICreateRepository<Media, Omit<Media, "media_id" | "created_at">>,
    IReadRepository<Media>,
    IDeleteRepository,
    IUpdateRepository<Media> {
  getByPropertyId(propertyId: string): Promise<Media[]>;
}

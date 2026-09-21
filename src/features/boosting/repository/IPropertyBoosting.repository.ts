import { PropertyBoosting } from "../models/property_boosting.model";
import { ICreateRepository } from "../../../shared/repositories/create.repository";
import { IReadRepository } from "../../../shared/repositories/read.repository";
import { IUpdateRepository } from "../../../shared/repositories/update.repository";
import { IDeleteRepository } from "../../../shared/repositories/delete.repository";

export interface IPropertyBoostingRepository
  extends
    ICreateRepository<
      PropertyBoosting,
      Omit<PropertyBoosting, "property_boosting_id">
    >,
    IReadRepository<PropertyBoosting>,
    IUpdateRepository<PropertyBoosting>,
    IDeleteRepository {
  getByPropertyId(propertyId: string): Promise<PropertyBoosting | null>;
}

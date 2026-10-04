import {
  PropertyBoosting,
  PropertyBoostingCreate,
} from "../models/property_boosting.model";
import { ICreateRepository } from "../../../shared/repositories/create.repository";
import { IReadRepository } from "../../../shared/repositories/read.repository";
import { IDeleteRepository } from "../../../shared/repositories/delete.repository";

export interface IPropertyBoostingRepository
  extends
    ICreateRepository<PropertyBoosting, PropertyBoostingCreate>,
    IReadRepository<PropertyBoosting>,
    IDeleteRepository {
  getCurrentByPropertyId(propertyId: string): Promise<PropertyBoosting | null>;
}

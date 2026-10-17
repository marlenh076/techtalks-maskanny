import { University } from "../models/university.model";
import { IReadRepository } from "../../../shared/repositories/read.repository";
import { ISearchRepository } from "../../../shared/repositories/search.repository";

export interface UniversityFilters {
  query?: string;
  city?: string;
}

export interface IUniversityRepository
  extends IReadRepository<University>, ISearchRepository<University, UniversityFilters> {}

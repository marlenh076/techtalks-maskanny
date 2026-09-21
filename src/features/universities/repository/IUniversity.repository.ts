import { University } from "../models/university.model";
import { IReadRepository } from "../../../shared/repositories/read.repository";
import { IUpdateRepository } from "../../../shared/repositories/update.repository";
import { IDeleteRepository } from "../../../shared/repositories/delete.repository";
import { ISearchRepository } from "../../../shared/repositories/search.repository";

export interface UniversityFilters {
  query?: string;
  city?: string;
}

export interface IUniversityRepository
  extends
    IReadRepository<University>,
    IUpdateRepository<University>,
    IDeleteRepository,
    ISearchRepository<University, UniversityFilters> 
    {}

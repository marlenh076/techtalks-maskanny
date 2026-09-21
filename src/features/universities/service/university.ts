import { University } from "../models/university.model";
import { IUniversityRepository, UniversityFilters } from "../repository/IUniversity.repository";

export class UniversityService {
  constructor(private universityRepository: IUniversityRepository) {}

  async getById(id: string): Promise<University | null> {
    return this.universityRepository.getById(id);
  }

  async getAll(): Promise<University[]> {
    return this.universityRepository.getAll();
  }

  async search(filters: UniversityFilters): Promise<University[]> {
    return this.universityRepository.search(filters);
  }
}

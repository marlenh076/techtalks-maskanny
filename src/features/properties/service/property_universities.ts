import { University } from "@/src/features/universities/models/university.model";
import { IPropertyUniversityRepository } from "../repository/property_universities.repository";
import { Property } from "../models/property.model";

export class PropertyUniversityService {
  constructor(
    private propertyUniversityRepository: IPropertyUniversityRepository,
  ) {}

  async getUniversitiesByPropertyId(propertyId: string): Promise<University[]> {
    return this.propertyUniversityRepository.getUniversitiesByPropertyId(
      propertyId,
    );
  }

  async getPropertiesByUniversityId(universityId: string): Promise<Property[]> {
    return this.propertyUniversityRepository.getPropertiesByUniversityId(
      universityId,
    );
  }
}

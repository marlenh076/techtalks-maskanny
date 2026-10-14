import { University } from "@/src/features/universities/models/university.model";
import { IPropertyUniversityRepository } from "../repository/property_universities.repository";
import { Property } from "../models/property.model";
import type { UniversityService } from "@/src/features/universities/service/university";
import { propertyUniversitiesSchema } from "../validation/property-universities.schema";

export class InvalidUniversitySelectionError extends Error {}

export class PropertyUniversityService {
  constructor(
    private propertyUniversityRepository: IPropertyUniversityRepository,
  ) {}

  async associate(
    propertyId: string,
    universityIds: string[],
    universities: UniversityService,
  ): Promise<void> {
    const { university_ids: ids } = propertyUniversitiesSchema.parse({
      university_ids: universityIds,
    });
    if (!ids.length) return;
    const available = new Set((await universities.getAll()).map((u) => u.university_id));
    if (ids.some((id) => !available.has(id)))
      throw new InvalidUniversitySelectionError("One or more selected universities no longer exist. Your property is saved; university associations have not been completed.");
    await this.propertyUniversityRepository.associate(propertyId, ids);
  }

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

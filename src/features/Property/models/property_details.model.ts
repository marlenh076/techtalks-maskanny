export enum KitchenType {
  PRIVATE = "private",
  SHARED = "shared",
}

export enum BathroomType {
  PRIVATE = "private",
  SHARED = "shared",
}

export enum Gender {
  BOYS = "boys",
  GIRLS = "girls",
  MIXED = "Mixed",
}

export interface PropertyDetails {
  property_id: string;
  bedrooms: number;
  bathrooms: number;
  bed_count: number;
  furnished: boolean;
  electricity_included: boolean;
  kitchen_type: KitchenType;
  bathroom_type: BathroomType;
  gender: Gender;
}

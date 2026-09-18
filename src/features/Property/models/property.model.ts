export enum PropertyType {
  DORM = "dorm",
  STUDIO = "studio",
  APARTMENT = "apartment",
}

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
  MIXED = "mixed",
}

export interface Property {
  host_id: string;
  property_type: PropertyType;
  title: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  price: number;
  bedrooms: number;
  bathrooms: number;
  bed_count: number;
  furnished: boolean;
  electricity_included: boolean;
  kitchen_type: KitchenType;
  bathroom_type: BathroomType;
  gender: Gender;
}

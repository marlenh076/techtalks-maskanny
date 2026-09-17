export enum PropertyType {
  DORM = "dorm",
  STUDIO = "studio",
  APARTMENT = "apartment",
}

export interface Property {
  property_id: string;
  host_id: string;
  property_type: PropertyType;
  title: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  price: number;
  created_at: string;
}

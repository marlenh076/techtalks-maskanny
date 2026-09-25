export interface Property {
  property_id: string;
  host_id: string;

  property_type: "dorm" | "studio" | "apartment";

  title: string;
  description: string | null;
  address: string;

  latitude: number;
  longitude: number;

  price: number;
  created_at: string;

  bedrooms: number;
  bathrooms: number;
  bed_count: number;

  furnished: boolean;
  electricity_included: boolean;

  kitchen_type: "private" | "shared";
  bathroom_type: "private" | "shared";
  gender: "boys" | "girls" | "mixed";
}

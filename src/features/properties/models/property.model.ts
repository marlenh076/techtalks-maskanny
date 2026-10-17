export interface Property {
  property_id: string;
  host_id: string;
  approval_status: "pending" | "approved" | "rejected";

  property_type: "dorm" | "studio" | "apartment";

  title: string;
  description: string | null;
  address: string;

  latitude: number;
  longitude: number;
  price: number;

  bedrooms: number;
  bathrooms: number;
  bed_count: number;

  furnished: boolean;
  electricity_included: boolean;

  kitchen_type: "private" | "shared";
  bathroom_type: "private" | "shared";
  gender: "boys" | "girls" | "mixed";

  created_at: string;
  archived_at: string | null;
}

export type PropertyCreate = Omit<
  Property,
  "property_id" | "created_at" | "approval_status" | "archived_at"
>;

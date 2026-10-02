export type Gender = "male" | "female" | "mixed";

export interface Dorm {
  id: string;
  name: string;
  location: string;
  price: number;
  distanceFromUniversity?: number | null;
  availableRooms?: number | null;
  imageUrl?: string | null;
  university?: string | null;
  gender?: Gender | null;
  roomType?: string | null;
  facilities?: string[] | null;
}

export interface DormFilters {
  query: string;
  university: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  gender: "" | Gender;
  availableRooms: string;
  roomType: string;
}

export const EMPTY_FILTERS: DormFilters = {
  query: "",
  university: "",
  location: "",
  minPrice: "",
  maxPrice: "",
  gender: "",
  availableRooms: "",
  roomType: "",
};

export function hasActiveFilters(filters: DormFilters): boolean {
  return (Object.keys(EMPTY_FILTERS) as Array<keyof DormFilters>).some(
    (key) => filters[key] !== EMPTY_FILTERS[key]
  );
}

export function countActiveFilters(filters: DormFilters): number {
  return (Object.keys(EMPTY_FILTERS) as Array<keyof DormFilters>).filter(
    (key) => key !== "query" && filters[key] !== EMPTY_FILTERS[key]
  ).length;
}

export interface DormSearchResponse {
  dorms: Dorm[];
  total?: number;
}

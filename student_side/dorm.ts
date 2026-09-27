/**
 * Types for the student dorm search.
 *
 * ⚠️ ADAPT THIS FILE FIRST.
 * If your project already has a Dorm type (check src/types/ or wherever your
 * filter API route defines its response), delete this file and import from
 * there instead. Every other file in this feature imports from here, so fixing
 * the shape once here fixes the whole feature.
 */

export type Gender = "male" | "female" | "mixed";

export interface Dorm {
  id: string;
  name: string;
  location: string;
  /** Monthly price. Currency is formatted in the card, not stored here. */
  price: number;
  /** Optional: kilometres from the student's university. */
  distanceFromUniversity?: number | null;
  /** Optional: how many rooms are currently free. */
  availableRooms?: number | null;
  /** Optional: main photo. The card falls back to a placeholder when missing. */
  imageUrl?: string | null;
  university?: string | null;
  gender?: Gender | null;
  roomType?: string | null;
  facilities?: string[] | null;
}

/** The filter state held by the UI. Empty string / undefined means "not set". */
export interface DormFilters {
  /** Free-text search over name, location and university. */
  query: string;
  university: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  gender: "" | Gender;
  /** Minimum number of available rooms. */
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

/** True when the student has narrowed the list in any way. */
export function hasActiveFilters(filters: DormFilters): boolean {
  return (Object.keys(EMPTY_FILTERS) as Array<keyof DormFilters>).some(
    (key) => filters[key] !== EMPTY_FILTERS[key]
  );
}

/** How many filters are set, for the badge on the "Filters" button. */
export function countActiveFilters(filters: DormFilters): number {
  return (Object.keys(EMPTY_FILTERS) as Array<keyof DormFilters>).filter(
    (key) => key !== "query" && filters[key] !== EMPTY_FILTERS[key]
  ).length;
}

/** Shape your filter API returns. Adjust to match the real route. */
export interface DormSearchResponse {
  dorms: Dorm[];
  total?: number;
}

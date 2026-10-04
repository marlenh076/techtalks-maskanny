/**
 * All network code for dorm search lives here. Components never call fetch
 * directly — they go through useDormSearch, which calls searchDorms.
 *
 * ⚠️ ADAPT: change API_PATH and buildQuery to match your existing filter API.
 * Those two things are the only parts that know about your backend.
 */

import type { Dorm, DormFilters, DormSearchResponse } from "@/types/dorm";

/** Point this at your existing filter route. */
const API_PATH = "/api/dorms";

/** Thrown for any failed request so the UI can show one consistent message. */
export class DormApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "DormApiError";
    this.status = status;
  }
}

/**
 * Turns the UI filter state into query params.
 * Empty values are skipped so the API only receives filters the student set.
 *
 * ⚠️ ADAPT: rename the param keys to whatever your API expects
 * (e.g. `min_price` instead of `minPrice`).
 */
export function buildQuery(filters: DormFilters): string {
  const params = new URLSearchParams();

  const add = (key: string, value: string) => {
    const trimmed = value.trim();
    if (trimmed !== "") params.set(key, trimmed);
  };

  add("q", filters.query);
  add("university", filters.university);
  add("location", filters.location);
  add("minPrice", filters.minPrice);
  add("maxPrice", filters.maxPrice);
  add("gender", filters.gender);
  add("availableRooms", filters.availableRooms);
  add("roomType", filters.roomType);

  return params.toString();
}

/**
 * Accepts either `{ dorms: [...] }` or a bare array, so it keeps working if
 * your API returns the list directly.
 */
function normalise(data: unknown): Dorm[] {
  if (Array.isArray(data)) return data as Dorm[];
  if (data && typeof data === "object") {
    const body = data as Partial<DormSearchResponse> & { data?: Dorm[] };
    if (Array.isArray(body.dorms)) return body.dorms;
    if (Array.isArray(body.data)) return body.data;
  }
  return [];
}

/**
 * Fetches dorms for the given filters.
 *
 * @param signal - from an AbortController, so a newer search cancels an older
 *                 one and results can't arrive out of order.
 */
export async function searchDorms(
  filters: DormFilters,
  signal?: AbortSignal
): Promise<Dorm[]> {
  const query = buildQuery(filters);
  const url = query ? `${API_PATH}?${query}` : API_PATH;

  let response: Response;

  try {
    response = await fetch(url, {
      signal,
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    // Re-throw aborts untouched — the hook ignores them, they aren't failures.
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new DormApiError("Could not reach the server.");
  }

  if (!response.ok) {
    throw new DormApiError(
      `Request failed with status ${response.status}.`,
      response.status
    );
  }

  try {
    const data = await response.json();
    return normalise(data);
  } catch {
    throw new DormApiError("The server sent a response we couldn't read.");
  }
}

/**
 * Fetches a single dorm for the details page.
 * ⚠️ ADAPT: change the path if your detail route differs.
 */
export async function getDormById(
  id: string,
  signal?: AbortSignal
): Promise<Dorm> {
  let response: Response;

  try {
    response = await fetch(`${API_PATH}/${encodeURIComponent(id)}`, {
      signal,
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new DormApiError("Could not reach the server.");
  }

  if (!response.ok) {
    throw new DormApiError(
      `Request failed with status ${response.status}.`,
      response.status
    );
  }

  try {
    const data = await response.json();
    // Accepts `{ dorm: {...} }` or the object directly.
    if (data && typeof data === "object" && "dorm" in data) {
      return (data as { dorm: Dorm }).dorm;
    }
    return data as Dorm;
  } catch {
    throw new DormApiError("The server sent a response we couldn't read.");
  }
}

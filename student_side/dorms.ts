import type { Dorm, DormFilters, DormSearchResponse } from "./types";

/** ⚠️ Change this if your real API route has a different path. */
const API_PATH = "/api/dorms";

export class DormApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "DormApiError";
    this.status = status;
  }
}

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

function normalise(data: unknown): Dorm[] {
  if (Array.isArray(data)) return data as Dorm[];
  if (data && typeof data === "object") {
    const body = data as Partial<DormSearchResponse> & { data?: Dorm[] };
    if (Array.isArray(body.dorms)) return body.dorms;
    if (Array.isArray(body.data)) return body.data;
  }
  return [];
}

export async function searchDorms(
  filters: DormFilters,
  signal?: AbortSignal
): Promise<Dorm[]> {
  const query = buildQuery(filters);
  const url = query ? `${API_PATH}?${query}` : API_PATH;
  let response: Response;

  try {
    response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new DormApiError("Could not reach the server.");
  }

  if (!response.ok) {
    throw new DormApiError(`Request failed with status ${response.status}.`, response.status);
  }

  try {
    const data = await response.json();
    return normalise(data);
  } catch {
    throw new DormApiError("The server sent a response we couldn't read.");
  }
}

export async function getDormById(id: string, signal?: AbortSignal): Promise<Dorm> {
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
    throw new DormApiError(`Request failed with status ${response.status}.`, response.status);
  }
  try {
    const data = await response.json();
    if (data && typeof data === "object" && "dorm" in data) {
      return (data as { dorm: Dorm }).dorm;
    }
    return data as Dorm;
  } catch {
    throw new DormApiError("The server sent a response we couldn't read.");
  }
}

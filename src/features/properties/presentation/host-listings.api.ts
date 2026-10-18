import type { HostListing } from "./host-listings";

export async function hostRequest<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}`, ...init?.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      typeof body.error === "string" ? body.error : `Request failed (${response.status})`,
    );
  }
  return response.json() as Promise<T>;
}

export async function loadHostListings(token: string): Promise<HostListing[]> {
  return hostRequest<HostListing[]>("/api/host/properties?include=related", token);
}

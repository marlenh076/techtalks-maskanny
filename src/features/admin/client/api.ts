import { supabase } from "@/src/lib/supabase/client";
import type { AdminBoostQueue, AdminBoostRequest, AdminDirectoryDetail, AdminDirectoryEntry, AdminProfile, DashboardStatistics, EmailChangeResult, Page } from "../models/admin.model";
import type { ModerationPropertyDetails, ModerationPropertySummary } from "@/src/features/properties/models/property_moderation.model";
import { propertyEditSchema, rejectionSchema } from "../validation/admin.schema";

export class AdminRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}
export type Filters = Record<string, string | number | undefined>;
export type ReportType = "overview" | "users" | "listings";
export interface AdminReport { items: { metric: string; value: number; }[]; total: number; from: string; to: string; as_of: string; }
export function queryString(filters: Filters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) if (value !== undefined && value !== "") params.set(key, String(value));
  return params.toString();
}

/** Uses the existing browser session; the API and database decide Admin access. */
export function createAdminApi(
  token: () => Promise<string | null>,
  fetcher: typeof fetch = fetch,
  unauthorized: (status: number) => void = () => { },
) {
  async function request(path: string, init: RequestInit = {}) {
    let accessToken: string | null;
    try { accessToken = await token(); }
    catch (error) { if (error instanceof AdminRequestError && error.status === 401) unauthorized(401); throw error; }
    if (!accessToken) { unauthorized(401); throw new AdminRequestError("Sign in to access the Admin Dashboard.", 401); }
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);
    let response: Response;
    try { response = await fetcher(path, { ...init, headers, cache: "no-store" }); }
    catch (error) {
      if (init.signal?.aborted) throw error;
      throw new AdminRequestError("Unable to reach the server. Please try again.", 0);
    }
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      // Reauthentication failures (for example an incorrect current password)
      // can also be 403; only a role-denial response should hide the Dashboard.
      if (response.status === 401 || (response.status === 403 && payload?.error === "Forbidden")) unauthorized(response.status);
      throw new AdminRequestError(typeof payload?.error === "string" ? payload.error : "The request could not be completed.", response.status);
    }
    return response;
  }
  async function json<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await request(path, init);
    try { return await response.json() as T; }
    catch { throw new AdminRequestError("The server returned an invalid response.", 502); }
  }
  const write = <T>(path: string, body: unknown, method = "POST") => json<T>(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return {
    get: json,
    profile: (signal?: AbortSignal) => json<AdminProfile>("/api/admin/settings/profile", { signal }),
    statistics: (filters: Filters, signal?: AbortSignal) => json<DashboardStatistics>(`/api/admin/statistics?${queryString(filters)}`, { signal }),
    properties: async (filters: Filters, signal?: AbortSignal): Promise<Page<ModerationPropertySummary>> => {
      const response = await request(`/api/admin/properties?${queryString(filters)}`, { signal });
      const items = await response.json().catch(() => { throw new AdminRequestError("Invalid listing response.", 502); });
      const counts = ["X-Total-Count", "X-Page", "X-Page-Size"].map(key => {
        const value = response.headers.get(key);
        if (value === null || !/^\d+$/.test(value)) throw new AdminRequestError("Missing listing pagination data.", 502);
        return Number(value);
      });
      if (!counts.every(Number.isSafeInteger) || counts[1] < 1 || counts[2] < 1 || counts[2] > 100) throw new AdminRequestError("Invalid listing pagination data.", 502);
      if (!Array.isArray(items)) throw new AdminRequestError("Invalid listing response.", 502);
      return { items, total: counts[0], page: counts[1], page_size: counts[2] };
    },
    property: (id: string, signal?: AbortSignal) => json<ModerationPropertyDetails>(`/api/admin/properties/${encodeURIComponent(id)}`, { signal }),
    approve: (id: string) => write<{ message: string ;}>(`/api/admin/properties/${encodeURIComponent(id)}/approve`, {}),
    reject: (id: string, reason: string) => write<{ message: string ;}>(`/api/admin/properties/${encodeURIComponent(id)}/reject`, rejectionSchema.parse({ reason })),
    edit: (id: string, input: unknown) => write(`/api/admin/properties/${encodeURIComponent(id)}`, propertyEditSchema.parse(input), "PATCH"),
    directory: (kind: "users" | "hosts", filters: Filters, signal?: AbortSignal) => json<Page<AdminDirectoryEntry>>(`/api/admin/${kind}?${queryString(filters)}`, { signal }),
    directoryDetail: (kind: "users" | "hosts", id: string, signal?: AbortSignal) => json<AdminDirectoryDetail>(`/api/admin/${kind}/${encodeURIComponent(id)}`, { signal }),
    boosts: (filters: Filters, signal?: AbortSignal) => json<AdminBoostQueue>(`/api/admin/boosts?${queryString(filters)}`, { signal }),
    boost: (id: string, signal?: AbortSignal) => json<AdminBoostRequest>(`/api/admin/boosts/${encodeURIComponent(id)}`, { signal }),
    report: (type: ReportType, filters: Filters, signal?: AbortSignal) => json<AdminReport>(`/api/admin/reports?${queryString({ ...filters, type, format: "json" })}`, { signal }),
    csv: async (type: ReportType, filters: Filters) => {
      const response = await request(`/api/admin/reports?${queryString({ ...filters, type, format: "csv" })}`);
      if (!response.headers.get("content-type")?.includes("text/csv")) throw new AdminRequestError("The server did not return a CSV file.", 502);
      return response.blob();
    },
    names: (firstname: string, lastname: string) => write<AdminProfile>("/api/admin/settings/profile", { firstname, lastname }, "PATCH"),
    email: (email: string) => write<EmailChangeResult>("/api/admin/settings/profile", { email }, "PATCH"),
    password: (current_password: string, new_password: string, nonce?: string) => write<{ message: string ;}>("/api/admin/settings/password", { current_password, new_password, ...(nonce ? { nonce } : {}) }),
    avatar: (file: File) => { const form = new FormData(); form.set("file", file); return json<AdminProfile>("/api/admin/settings/avatar", { method: "POST", body: form }); },
    logout: () => json<{ message: string ;}>("/api/admin/settings/logout", { method: "POST" }),
  };
}
export const adminApi = createAdminApi(async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new AdminRequestError("Unable to read your session. Please sign in again.", 401);
  return data.session?.access_token ?? null;
}, (...args) => fetch(...args), status => {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("admin-access-denied", { detail: status }));
});

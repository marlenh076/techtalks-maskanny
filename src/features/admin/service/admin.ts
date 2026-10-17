import { AdminRepository } from "../repository/admin.repository";
import { AdminError } from "./errors";
import { toCsv } from "./csv";
import type { DashboardStatistics } from "../models/admin.model";

export type DashboardReport = "overview" | "users" | "listings";
export class AdminService {
  constructor(readonly repository: AdminRepository) {}
  async statistics(from: string, to: string): Promise<DashboardStatistics> {
    const data = await this.repository.statistics(from, to);
    return {
      as_of: data.as_of,
      from: data.from,
      to: data.to,
      users: data.users,
      hosts: data.hosts,
      properties: data.properties,
      property_types: data.property_types,
      unknown_host_creation_dates: data.unknown_host_creation_dates,
      trends: data.trends.flatMap((row) =>
        row.metric === "users" || row.metric === "hosts" || row.metric === "properties"
          ? [{ day: row.day, metric: row.metric, value: row.value }]
          : [],
      ),
    };
  }
  async report(type: DashboardReport, from: string, to: string) {
    // Each report and its CSV use one aggregate database snapshot.
    const data = await this.statistics(from, to);
    const registrations = (metric: "users" | "hosts" | "properties") =>
      data.trends
        .filter((row) => row.metric === metric)
        .reduce((total, row) => total + row.value, 0);
    const users = [
      { metric: "total_users", value: data.users },
      { metric: "total_hosts", value: data.hosts },
      { metric: "users_registered_in_range", value: registrations("users") },
      { metric: "hosts_registered_in_range", value: registrations("hosts") },
      { metric: "unknown_host_creation_dates", value: data.unknown_host_creation_dates },
    ];
    const listings = [
      ...Object.entries(data.properties).map(([key, value]) => ({
        metric: `${key}_properties`,
        value,
      })),
      { metric: "properties_created_in_range", value: registrations("properties") },
      ...Object.entries(data.property_types).map(([key, value]) => ({
        metric: `${key}_properties`,
        value,
      })),
    ];
    const items =
      type === "users" ? users : type === "listings" ? listings : [...users, ...listings];
    return {
      items,
      total: items.length,
      from,
      to,
      as_of: data.as_of,
      csv: () => toCsv(items, ["metric", "value"]),
    };
  }
  async profile() {
    const profile = await this.repository.profile();
    if (!profile.avatar_path) return { ...profile, avatar_url: null };
    const { data, error } = await this.repository.client.storage
      .from("admin-avatars")
      .createSignedUrl(profile.avatar_path, 300);
    if (error) throw new AdminError("Unable to sign avatar URL", 502);
    return { ...profile, avatar_url: data.signedUrl };
  }
}

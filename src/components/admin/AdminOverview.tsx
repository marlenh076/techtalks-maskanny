"use client";
import { useCallback, useMemo } from "react";
import { adminApi, queryString } from "@/src/features/admin/client/api";
import { useAdminQuery } from "@/src/features/admin/client/hooks";
import { dateLabel, dateRange, type DatePreset } from "@/src/features/admin/client/format";
import { MetricCard } from "./MetricCard";
import { AnalyticsChart } from "./AnalyticsChart";
import { CategoryDonut } from "./CategoryDonuts";
import RecentSubmissions from "./RecentSubmissions";
import { EmptyState, QueryState } from "./AdminUI";

export default function AdminOverview({ preset, onViewListings }: { preset: DatePreset; onViewListings: (status: "all" | "pending") => void }) {
  const range = useMemo(() => dateRange(preset), [preset]); const key = queryString(range);
  const statsLoad = useCallback((signal: AbortSignal) => adminApi.statistics(Object.fromEntries(new URLSearchParams(key)), signal), [key]);
  const stats = useAdminQuery(key, statsLoad);
  const pendingLoad = useCallback((signal: AbortSignal) => adminApi.properties({ status: "pending", page_size: 6 }, signal), []);
  const recentLoad = useCallback((signal: AbortSignal) => adminApi.properties({ status: "all", page_size: 3 }, signal), []);
  const usersLoad = useCallback((signal: AbortSignal) => adminApi.directory("users", { page_size: 3 }, signal), []);
  const pending = useAdminQuery("overview-pending", pendingLoad), recent = useAdminQuery("overview-recent", recentLoad), users = useAdminQuery("overview-users", usersLoad);
  return <div className="space-y-6">
    <QueryState loading={stats.loading} error={stats.error} retry={stats.reload} />
    {stats.data && <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard title="Total Properties" value={stats.data.properties.total.toLocaleString()} />
        <MetricCard title="Total Accounts" value={stats.data.users.toLocaleString()} />
        <MetricCard title="Property Owners" value={stats.data.hosts.toLocaleString()} />
        <MetricCard title="Pending Moderation" value={stats.data.properties.pending.toLocaleString()} subtitle={stats.data.properties.pending ? "Action needed" : "All clear"} />
      </div>
      <p className="text-xs text-brand-slate">Totals show all current records. The selected date range applies to creation trends. Accounts include users, Hosts and Admins.</p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><AnalyticsChart trends={stats.data.trends} from={stats.data.from} to={stats.data.to} /><CategoryDonut counts={stats.data.property_types} /></div>
      {stats.data.unknown_host_creation_dates > 0 && <p className="text-xs text-brand-slate">{stats.data.unknown_host_creation_dates} older Host creation dates were not recorded and are excluded from growth trends.</p>}
    </>}
    <div className="space-y-2"><h3 className="text-xs font-bold uppercase tracking-wider">Pending Listings Status Overview</h3><QueryState loading={pending.loading} error={pending.error} retry={pending.reload} />{pending.data && <RecentSubmissions submissions={pending.data.items} total={pending.data.total} isReadOnly onViewAll={() => onViewListings("pending")} />}</div>
    <div className="space-y-2 pt-2"><h3 className="text-xs font-bold uppercase tracking-wider">Recent Account Registrations</h3><QueryState loading={users.loading} error={users.error} retry={users.reload} />
      {users.data && <div className="bg-white rounded-2xl border border-brand-slate/15 shadow-xs overflow-x-auto"><table className="w-full text-left text-xs text-brand-navy"><thead className="bg-brand-light/60 text-brand-slate uppercase"><tr><th className="p-4">Account</th><th className="p-3">Email</th><th className="p-3">Registered</th><th className="p-4">Role</th></tr></thead><tbody className="divide-y divide-brand-slate/10">{users.data.items.map(row => <tr key={row.user_id}><td className="p-4 font-semibold">{row.firstname} {row.lastname}</td><td className="p-3">{row.email}</td><td className="p-3">{dateLabel(row.user_created_at)}</td><td className="p-4 capitalize">{row.role}{row.host_id ? " · Host" : ""}</td></tr>)}</tbody></table>{!users.data.items.length && <EmptyState>No registered accounts.</EmptyState>}</div>}
    </div>
    <div className="space-y-2 pt-2"><h3 className="text-xs font-bold uppercase tracking-wider">Recent Host Property Submissions</h3><QueryState loading={recent.loading} error={recent.error} retry={recent.reload} />{recent.data && <RecentSubmissions submissions={recent.data.items} total={recent.data.total} isReadOnly onViewAll={() => onViewListings("all")} />}</div>
  </div>;
}

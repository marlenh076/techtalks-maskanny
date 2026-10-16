"use client";
import { useCallback, useState } from "react";
import { BarChart3, Building2, Users, Download } from "lucide-react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  adminApi,
  queryString,
  type ReportType,
} from "@/src/features/admin/client/api";
import {
  errorMessage,
  useAdminAction,
  useAdminQuery,
} from "@/src/features/admin/client/hooks";
import {
  calendarDate,
  calendarRange,
  dateRange,
} from "@/src/features/admin/client/format";
import { MetricCard } from "./MetricCard";
import { AnalyticsChart } from "./AnalyticsChart";
import { EmptyState, QueryState, buttonClass, inputClass } from "./AdminUI";

export default function ReportsSidebar() {
  const [type, setType] = useState<ReportType>("overview");
  const [range, setRange] = useState(() => dateRange("MONTH"));
  const [from, setFrom] = useState(() => calendarDate(new Date(range.from)));
  const [to, setTo] = useState(() => calendarDate(new Date()));
  const [appliedDates, setAppliedDates] = useState({ from, to });
  const datesChanged = from !== appliedDates.from || to !== appliedDates.to;
  const [rangeError, setRangeError] = useState("");
  const key = queryString(range);
  const load = useCallback(
    (signal: AbortSignal) =>
      adminApi.report(
        type,
        Object.fromEntries(new URLSearchParams(key)),
        signal,
      ),
    [key, type],
  );
  const result = useAdminQuery(type + key, load);
  const statsLoad = useCallback(
    (signal: AbortSignal) =>
      adminApi.statistics(Object.fromEntries(new URLSearchParams(key)), signal),
    [key],
  );
  const stats = useAdminQuery(type === "listings" ? null : key, statsLoad);
  const download = useAdminAction();
  async function exportCsv() {
    await download.run(async () => {
      const blob = await adminApi.csv(type, range);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      try {
        link.href = url;
        link.download = `maskanny-${type}.csv`;
        document.body.appendChild(link);
        link.click();
      } finally {
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 0);
      }
    });
  }
  const counts = result.data
    ? ["approved", "pending", "rejected", "active"]
        .map((status) => ({
          status,
          count: result.data!.items.find(
            (row) => row.metric === `${status}_properties`,
          )?.value,
        }))
        .filter((row) => row.count !== undefined)
    : [];
  return (
    <div className="flex flex-col gap-6 w-full flex-1">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-brand-slate/15">
        {[
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "users", label: "User Reports", icon: Users },
          { id: "listings", label: "Listing Reports", icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setType(tab.id as ReportType)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 ${type === tab.id ? "bg-brand-navy text-white shadow-sm" : "bg-white text-brand-slate border border-brand-slate/15"}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>
      <form
        className="bg-white p-4 rounded-2xl border border-brand-slate/15 flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          try {
            setRange(calendarRange(from, to));
            setAppliedDates({ from, to });
            setRangeError("");
          } catch (error) {
            setRangeError(errorMessage(error));
          }
        }}
      >
        <label className="block !mb-0 text-xs font-bold">
          Start date
          <input
            type="date"
            required
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className={inputClass + " mt-1 block"}
          />
        </label>
        <label className="block !mb-0 text-xs font-bold">
          End date (inclusive)
          <input
            type="date"
            required
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className={inputClass + " mt-1 block"}
          />
        </label>
        <button className={buttonClass}>Apply dates</button>
        <button
          type="button"
          disabled={
            download.pending || result.loading || !result.data || !!rangeError || datesChanged
          }
          onClick={exportCsv}
          className={buttonClass + " inline-flex items-center gap-2"}
        >
          <Download className="w-4 h-4" />
          {download.pending ? "Downloading…" : "Download CSV"}
        </button>
      </form>
      {datesChanged && <p role="status" className="text-xs text-brand-slate">Apply the selected dates before downloading a report.</p>}
      <QueryState error={rangeError || download.error} />
      <QueryState
        loading={result.loading}
        error={result.error}
        retry={result.reload}
      />
      {result.data && (
        <>
          <p className="text-xs text-brand-slate">
            Current totals as of {new Date(result.data.as_of).toLocaleString()}.
            Creation counts use {new Date(result.data.from).toLocaleString()}{" "}
            through {new Date(result.data.to).toLocaleString()} (end exclusive).
            Range must be at most 366 days.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.data.items.map((row) => (
              <MetricCard
                key={row.metric}
                title={row.metric.replaceAll("_", " ")}
                value={row.value.toLocaleString()}
              />
            ))}
          </div>
          {!result.data.items.length && (
            <EmptyState>No supported report data.</EmptyState>
          )}
          {counts.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-brand-slate/15 shadow-sm">
              <h3 className="font-bold text-base">
                Listing Moderation & Publication
              </h3>
              <p className="text-xs text-brand-slate mb-5">
                Published listings are a subset of moderation-approved
                properties.
              </p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={counts}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2B4162" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
      {type !== "listings" && (
        <>
          <QueryState
            loading={stats.loading}
            error={stats.error}
            retry={stats.reload}
          />
          {stats.data && <AnalyticsChart trends={stats.data.trends} from={stats.data.from} to={stats.data.to} />}
        </>
      )}
      <p className="text-xs text-brand-slate">
        Review, occupancy, search, favorites and contact-activity reports are
        unavailable because those data models are not implemented.
      </p>
    </div>
  );
}

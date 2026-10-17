"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { hostRequest } from "@/src/features/properties/presentation/host-listings.api";
import {
  dailyViewSeries,
  totalViews,
  viewYAxisMax,
  type DailyViews,
  type ViewPeriod,
  type ViewRange,
} from "@/src/features/properties/service/property-view-analytics";

type ViewResponse = ViewRange & { period: ViewPeriod; daily: DailyViews[] };

export function AnalyticsChart({ token, period }: { token: string | null; period: ViewPeriod }) {
  const [result, setResult] = useState<ViewResponse | null>(null);
  const [errorPeriod, setErrorPeriod] = useState<ViewPeriod | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    hostRequest<ViewResponse>(`/api/host/analytics/views?period=${period}`, token)
      .then((data) => {
        if (!cancelled) {
          setResult(data);
          setErrorPeriod(null);
        }
      })
      .catch(() => {
        if (!cancelled) setErrorPeriod(period);
      });
    return () => {
      cancelled = true;
    };
  }, [token, period, attempt]);

  const current = result?.period === period ? result : null;
  const error = errorPeriod === period;
  const loading = !current && !error;
  const data = dailyViewSeries(current?.daily ?? [], period, new Date(), current ?? undefined);
  const total = current ? totalViews(current.daily) : 0;
  const max = viewYAxisMax(Math.max(0, ...data.map((row) => row.views)));
  const label = (day: string) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      ...(period === "ALL" && data.length > 365 ? { year: "numeric" as const } : {}),
      timeZone: "UTC",
    }).format(new Date(`${day}T00:00:00Z`));

  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-brand-slate/15 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="font-bold text-brand-navy text-base">Student Views For Listings</h3>
          <p className="text-xs text-brand-slate">
            Tracked public property views for the selected period
          </p>
          {current && (
            <p className="mt-1 text-xs font-semibold text-brand-navy">
              {total.toLocaleString()} {total === 1 ? "view" : "views"} total
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs font-medium pt-1">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-navy shrink-0" />
          <span className="text-brand-navy font-semibold">Student Views</span>
        </div>
      </div>
      <div className="h-70 w-full relative" aria-label="Daily public property views">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9EDF3" />
            <XAxis
              dataKey="day"
              tickFormatter={label}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#385F71" }}
              minTickGap={24}
              interval="preserveStartEnd"
            />
            <YAxis
              allowDecimals={false}
              domain={[0, max]}
              tickCount={5}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#385F71" }}
            />
            <Tooltip
              labelFormatter={(value) => label(String(value))}
              formatter={(value) => [
                `${Number(value).toLocaleString()} ${Number(value) === 1 ? "view" : "views"}`,
                "Student views",
              ]}
              contentStyle={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                borderColor: "rgba(56,95,113,0.2)",
                fontSize: "12px",
              }}
            />
            {total > 0 && (
              <Line
                name="Student Views"
                type="monotone"
                dataKey="views"
                stroke="#4F83CC"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: "#4F83CC", stroke: "#FFFFFF", strokeWidth: 2 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
        {loading && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
            <div
              role="status"
              className="rounded-xl border border-brand-slate/15 bg-white/95 px-5 py-3 text-center text-xs font-medium text-brand-slate shadow-sm"
            >
              Loading student views…
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-white/95 px-5 py-3 text-center text-xs font-medium text-rose-700 shadow-sm"
            >
              <p>Student views could not be loaded.</p>
              <button
                type="button"
                onClick={() => setAttempt((value) => value + 1)}
                className="mt-2 font-bold underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}
        {!loading && !error && current && total === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
            <p
              role="status"
              className="rounded-xl border border-brand-slate/15 bg-white/95 px-5 py-3 text-center text-xs font-medium text-brand-slate shadow-sm"
            >
              No public property views recorded for this period yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

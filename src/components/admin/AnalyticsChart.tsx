"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DashboardStatistics } from "@/src/features/admin/models/admin.model";
import { growthRows } from "@/src/features/admin/client/format";
import { EmptyState } from "./AdminUI";
export function AnalyticsChart({
  trends,
  from,
  to,
}: Pick<DashboardStatistics, "trends" | "from" | "to">) {
  const data = growthRows(trends, { from, to });
  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-brand-slate/15 shadow-sm">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h3 className="font-bold text-brand-navy text-base">Platform Growth</h3>
          <p className="text-xs text-brand-slate">
            Recorded creations by UTC day in the selected range
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          {[
            { label: "Accounts", color: "#2B4162" },
            { label: "Hosts", color: "#D7B377" },
            { label: "Properties", color: "#8F5D38" },
          ].map((item) => (
            <span key={item.label} className="flex items-center gap-1.5 text-brand-slate">
              <span className="w-3 h-3 rounded-full" style={{ background: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>
      <div className="h-64 w-full">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {[
                  { key: "users", color: "#2B4162" },
                  { key: "hosts", color: "#D7B377" },
                  { key: "properties", color: "#8F5D38" },
                ].map((item) => (
                  <linearGradient
                    key={item.key}
                    id={`growth-${item.key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={item.color} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={item.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F0F6" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#385F71" }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#385F71" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "12px",
                  borderColor: "rgba(56,95,113,0.2)",
                  fontSize: "12px",
                }}
              />
              {[
                { key: "users", name: "Accounts", color: "#2B4162" },
                { key: "hosts", name: "Hosts", color: "#D7B377" },
                { key: "properties", name: "Properties", color: "#8F5D38" },
              ].map((item) => (
                <Area
                  key={item.key}
                  name={item.name}
                  type="monotone"
                  dataKey={item.key}
                  stroke={item.color}
                  strokeWidth={2.5}
                  fill={`url(#growth-${item.key})`}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState>No recorded creations in this date range.</EmptyState>
        )}
      </div>
    </div>
  );
}

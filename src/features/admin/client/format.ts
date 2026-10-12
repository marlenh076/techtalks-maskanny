import type { ModerationPropertySummary } from "@/src/features/properties/models/property_moderation.model";
import type { DashboardStatistics } from "../models/admin.model";
import { rangeSchema } from "../validation/admin.schema";

export type DatePreset = "TODAY" | "WEEK" | "MONTH" | "YEAR";
export function dateRange(preset: DatePreset, now = new Date()) {
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);
  if (preset === "WEEK") from.setDate(from.getDate() - 6);
  if (preset === "MONTH") from.setDate(from.getDate() - 29);
  if (preset === "YEAR") from.setDate(from.getDate() - 364);
  return { from: from.toISOString(), to: now.toISOString() };
}
export function dateLabel(value: string | null | undefined) {
  return value ? new Date(value).toLocaleDateString() : "Date not recorded";
}
export function propertyStatus(row: Pick<ModerationPropertySummary, "approval_status" | "is_live">) {
  if (row.is_live) return "Published / Active";
  return row.approval_status === "approved" ? "Approved — hidden" : row.approval_status === "pending" ? "Pending review" : "Rejected";
}
export const paymentLabels = { not_submitted: "Not submitted", legacy_unrecorded: "Legacy payment unrecorded", pending: "Pending verification", verified: "Verified", rejected: "Rejected" };
export function amountLabel(amount: number | null, currency: string | null) {
  if (amount === null) return "Amount not recorded";
  return `${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}${currency ? ` ${currency}` : " (currency not recorded)"}`;
}
export function growthRows(trends: DashboardStatistics["trends"], range?: { from: string; to: string }) {
  const days = new Map<string, { day: string; users: number; hosts: number; properties: number; }>();
  if (range && trends.length) {
    const start = new Date(range.from);
    start.setUTCHours(0, 0, 0, 0);
    for (let time = start.getTime(); time < Date.parse(range.to); time += 86400000) {
      const day = new Date(time).toISOString().slice(0, 10);
      days.set(day, { day, users: 0, hosts: 0, properties: 0 });
    }
  }
  for (const row of trends) {
    const day = days.get(row.day) ?? { day: row.day, users: 0, hosts: 0, properties: 0 };
    day[row.metric] += row.value;
    days.set(row.day, day);
  }
  return [...days.values()].sort((a, b) => a.day.localeCompare(b.day));
}
export function calendarDate(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}
export function calendarRange(fromDay: string, toDay: string) {
  const from = new Date(`${fromDay}T00:00:00`), to = new Date(`${toDay}T00:00:00`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fromDay) || !/^\d{4}-\d{2}-\d{2}$/.test(toDay) ||
    Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || calendarDate(from) !== fromDay || calendarDate(to) !== toDay) throw new Error("Choose valid start and end dates.");
  to.setDate(to.getDate() + 1);
  return rangeSchema.parse({ from: from.toISOString(), to: to.toISOString() });
}

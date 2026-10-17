export type ViewPeriod = "ALL" | "TODAY" | "WEEK" | "MONTH";
export type DailyViews = { day: string; views: number };

export function totalViews(rows: DailyViews[]): number {
  return rows.reduce((total, row) => total + row.views, 0);
}

export function viewYAxisMax(value: number): number {
  if (!Number.isFinite(value) || value <= 1) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const fraction = value / magnitude;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return niceFraction * magnitude;
}

export type ViewRange = { from: string | null; to: string };

export function viewRange(period: ViewPeriod, now = new Date()) {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const tomorrow = new Date(today.getTime() + 86_400_000);
  let from: Date | null = null;
  if (period === "TODAY") from = today;
  if (period === "WEEK")
    from = new Date(today.getTime() - ((today.getUTCDay() + 6) % 7) * 86_400_000);
  if (period === "MONTH") from = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  return { from: from?.toISOString() ?? null, to: tomorrow.toISOString() };
}

export function dailyViewSeries(
  rows: DailyViews[],
  period: ViewPeriod,
  now = new Date(),
  range?: ViewRange,
): DailyViews[] {
  const fallbackRange = viewRange(period, now);
  const from = range?.from ?? fallbackRange.from;
  const to = range?.to ?? fallbackRange.to;
  const end = new Date(Date.parse(to) - 86_400_000);
  let start = from
    ? new Date(from)
    : rows.length
      ? new Date(`${rows[0].day}T00:00:00.000Z`)
      : new Date(end.getTime() - 29 * 86_400_000);

  // All Time has no lower bound. Give a lone current-day observation enough
  // calendar context to read without adding any non-zero or interpolated data.
  if (period === "ALL" && rows.length && end.getTime() - start.getTime() < 2 * 86_400_000) {
    start = new Date(end.getTime() - 2 * 86_400_000);
  }
  const counts = new Map(rows.map((row) => [row.day, row.views]));
  const result: DailyViews[] = [];
  for (let day = start.getTime(); day <= end.getTime(); day += 86_400_000) {
    const key = new Date(day).toISOString().slice(0, 10);
    result.push({ day: key, views: counts.get(key) ?? 0 });
  }
  return result;
}

"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
}

export function MetricCard({ title, value, change, isPositive = true, subtitle }: MetricCardProps) {
  return (
    <div className="flex min-w-0 flex-col items-center justify-center rounded-2xl border border-brand-slate/15 bg-white p-5 text-center shadow-sm transition-all hover:border-brand-slate/30">
      <span className="block w-full truncate text-center text-xs font-semibold uppercase tracking-wider text-brand-slate">
        {title}
      </span>

      <span className="mt-2 text-2xl font-bold tabular-nums text-brand-navy">{value}</span>

      {change && (
        <span
          className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
            isPositive ? "bg-brand-gold/20 text-brand-navy" : "bg-rose-50 text-rose-700"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="mr-1 h-3 w-3 text-brand-bronze" />
          ) : (
            <TrendingDown className="mr-1 h-3 w-3" />
          )}
          {change}
        </span>
      )}

      {subtitle && (
        <span className="mt-2 inline-flex max-w-full items-center justify-center rounded-full border border-brand-slate/10 bg-brand-light px-2.5 py-0.5 text-center text-xs font-semibold text-brand-navy">
          {subtitle}
        </span>
      )}
    </div>
  );
}

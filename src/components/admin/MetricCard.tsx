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
    <div className="flex flex-col items-center justify-center bg-white p-5 rounded-2xl border border-brand-slate/15 shadow-sm transition-all hover:border-brand-slate/30 min-w-0">
      <span className="text-xs font-semibold text-center text-brand-slate uppercase tracking-wider block truncate">
        {title}
      </span>

      <div className="flex items-baseline justify-center gap-2 flex-wrap mt-2">
        <span className="text-2xl font-bold text-brand-navy tabular-nums shrink-0">{value}</span>

        {change && (
          <span
            className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
              isPositive ? "text-brand-navy bg-brand-gold/20" : "text-rose-700 bg-rose-50"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3 mr-1 text-brand-bronze" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            {change}
          </span>
        )}

        {subtitle && (
          <span className="inline-flex items-center text-xs font-semibold text-brand-navy bg-brand-light px-2.5 py-0.5 rounded-full border border-brand-slate/10 shrink-0">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

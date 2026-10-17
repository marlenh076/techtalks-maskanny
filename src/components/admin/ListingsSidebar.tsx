"use client";
import {
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  Home,
  Building,
  GraduationCap,
} from "lucide-react";
export interface ListingFilter {
  status: "all" | "pending" | "approved" | "active" | "rejected";
  category: "all" | "apartment" | "studio" | "dorm";
}
export default function ListingsSidebar({
  filters,
  pendingCount,
  totalCount,
  onFilterChange,
}: {
  filters: ListingFilter;
  pendingCount?: number;
  totalCount?: number;
  onFilterChange: (value: ListingFilter) => void;
}) {
  return (
    <aside className="w-full xl:w-[272px] 2xl:w-72 bg-white rounded-2xl border border-brand-slate/15 p-5 shadow-2xs space-y-6 shrink-0 self-start">
      <div className="flex items-center gap-2 pb-4 border-b border-brand-slate/10">
        <Filter className="w-4 h-4" />
        <h3 className="font-bold text-sm uppercase tracking-wider">Listing Filters</h3>
      </div>
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-brand-slate uppercase tracking-wider block mb-2">
          Moderation & Visibility
        </span>
        {[
          { id: "pending", label: "Pending Review", icon: Clock, count: pendingCount },
          { id: "all", label: "All Submissions", icon: Building2, count: totalCount },
          { id: "approved", label: "Moderation Approved", icon: CheckCircle2 },
          { id: "active", label: "Published / Active", icon: CheckCircle2 },
          { id: "rejected", label: "Rejected", icon: XCircle },
        ].map((item) => {
          const Icon = item.icon;
          const selected = filters.status === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() =>
                onFilterChange({ ...filters, status: item.id as ListingFilter["status"] })
              }
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all ${selected ? "bg-brand-navy text-white shadow-2xs" : "text-brand-navy hover:bg-brand-light/80"}`}
            >
              <span className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${selected ? "text-brand-gold" : "text-brand-slate"}`} />
                {item.label}
              </span>
              {item.count !== undefined && (
                <span className="px-2 py-0.5 rounded-full bg-brand-gold/20 text-[10px] font-bold">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="space-y-1.5 pt-4 border-t border-brand-slate/10">
        <span className="text-xs font-semibold text-brand-slate uppercase tracking-wider block mb-2">
          Property Type
        </span>
        {[
          { id: "all", label: "All Types", icon: Building2 },
          { id: "dorm", label: "Dormitories", icon: GraduationCap },
          { id: "studio", label: "Studio Flats", icon: Building },
          { id: "apartment", label: "Apartments", icon: Home },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() =>
                onFilterChange({ ...filters, category: item.id as ListingFilter["category"] })
              }
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-full text-xs transition-all ${filters.category === item.id ? "bg-brand-light text-brand-navy font-bold border border-brand-slate/20" : "text-brand-slate hover:bg-brand-light/50"}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

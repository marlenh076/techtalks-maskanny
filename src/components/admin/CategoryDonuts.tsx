"use client";
import type { DashboardStatistics } from "@/src/features/admin/models/admin.model";
export function CategoryDonut({ counts }: { counts: DashboardStatistics["property_types"] ;}) {
  const total = counts.apartment + counts.studio + counts.dorm;
  const first = total ? counts.apartment / total * 100 : 0, second = total ? counts.studio / total * 100 : 0;
  const background = total ? `conic-gradient(#2B4162 0% ${first}%, #D7B377 ${first}% ${first + second}%, #8F5D38 ${first + second}% 100%)` : "#F5F0F6";
  return <div className="bg-white p-6 rounded-2xl border border-brand-slate/15 shadow-sm flex flex-col justify-between">
    <div><h3 className="font-bold text-brand-navy text-base mb-1">Listings by Type</h3><p className="text-xs text-brand-slate mb-6">Current property distribution</p>
      <div className="h-48 flex items-center justify-center"><div className="w-36 h-36 rounded-full p-3.5 flex items-center justify-center relative shadow-inner" style={{ background }}><div className="w-full h-full bg-white rounded-full flex flex-col items-center justify-center shadow-sm"><span className="text-lg font-bold text-brand-navy">{total.toLocaleString()}</span><span className="text-[10px] uppercase text-brand-slate">Total</span></div></div></div>
    </div>
    <div className="mt-4 space-y-2.5 text-xs">{[{ key: "apartment", name: "Apartments", color: "#2B4162" }, { key: "studio", name: "Studio Flats", color: "#D7B377" }, { key: "dorm", name: "Dormitories", color: "#8F5D38" }].map(item => <div key={item.key} className="flex justify-between items-center"><span className="flex items-center gap-2 text-brand-slate"><span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />{item.name}</span><span className="font-bold">{counts[item.key as keyof typeof counts]} · {total ? (counts[item.key as keyof typeof counts] / total * 100).toFixed(1) : "0"}%</span></div>)}</div>
  </div>;
}

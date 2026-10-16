"use client";
import { useCallback, useMemo, useState } from "react";
import { Search, CheckCircle2, XCircle } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { adminApi, queryString } from "@/src/features/admin/client/api";
import { useAdminQuery } from "@/src/features/admin/client/hooks";
import { amountLabel, dateLabel, dateRange, paymentLabels } from "@/src/features/admin/client/format";
import { AdminModal, EmptyState, Pagination, QueryState, buttonClass, inputClass } from "./AdminUI";
export default function BoostingPlansView() {
  const [search, setSearch] = useState(""); const [query, setQuery] = useState("");
  const [payment, setPayment] = useState(""); const [boost, setBoost] = useState(""); const [preset, setPreset] = useState("ALL");
  const [page, setPage] = useState(1); const [size, setSize] = useState(25); const [selected, setSelected] = useState<string | null>(null);
  const range = useMemo(() => preset === "ALL" ? {} : dateRange(preset as "TODAY" | "WEEK" | "MONTH"), [preset]);
  const key = queryString({ ...range, page, page_size: size, query, payment_status: payment, boost_status: boost });
  const load = useCallback((signal: AbortSignal) => adminApi.boosts(Object.fromEntries(new URLSearchParams(key)), signal), [key]);
  const result = useAdminQuery(key, load);
  const detailLoad = useCallback((signal: AbortSignal) => selected ? adminApi.boost(selected, signal) : Promise.reject(new Error("Choose a boost request.")), [selected]);
  const detail = useAdminQuery(selected, detailLoad);
  return <div className="space-y-6">
    <QueryState loading={result.loading} error={result.error} retry={result.reload} />
    {result.data && <><div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-3">
      <MetricCard title="Pending Payments" value={result.data.payment_counts.pending.toLocaleString()} subtitle="Awaiting verification" />
      <MetricCard title="Verified Payments" value={result.data.payment_counts.verified.toLocaleString()} />
      <MetricCard title="Rejected Payments" value={result.data.payment_counts.rejected.toLocaleString()} />
    </div><p className="text-xs text-brand-slate">Counts cover the latest payment attempt for each boost, across all filters. {result.data.payment_counts.not_submitted} requests have no submitted payment; {result.data.payment_counts.legacy_unrecorded} legacy payments have no recorded transfer details.</p></>}
    <p className="rounded-xl border border-brand-slate/15 bg-white p-4 text-xs text-brand-slate">Payment approval, rejection and boost activation are unavailable until the payment submission and review workflow is finalized. These requests are read-only. Property moderation approval remains separate.</p>
    <form className="flex flex-wrap items-center gap-2" onSubmit={event => { event.preventDefault(); setQuery(search.trim()); setPage(1); }}>
      <div className="relative min-w-48 flex-1"><Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-slate" /><input aria-label="Search boost requests" value={search} maxLength={200} onChange={event => setSearch(event.target.value)} placeholder="Search listings, owners, references…" className={inputClass + " !py-1.5 !pl-8 !text-xs"} /></div><button className={buttonClass + " !px-2.5 !py-1.5 [&]:!text-xs"}>Search</button>
      <select aria-label="Filter by payment status" value={payment} onChange={event => { setPayment(event.target.value); setPage(1); }} className="rounded-xl border border-brand-slate/15 bg-white !px-2.5 !py-1.5 !text-xs"><option value="">All payment statuses</option>{Object.entries(paymentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <select aria-label="Filter by boost status" value={boost} onChange={event => { setBoost(event.target.value); setPage(1); }} className="rounded-xl border border-brand-slate/15 bg-white !px-2.5 !py-1.5 !text-xs"><option value="">All boost statuses</option>{["pending", "active", "expired", "rejected"].map(value => <option key={value} value={value}>{value}</option>)}</select>
      <select aria-label="Request submission date" value={preset} onChange={event => { setPreset(event.target.value); setPage(1); }} className="rounded-xl border border-brand-slate/15 bg-white !px-2.5 !py-1.5 !text-xs"><option value="ALL">All Time</option><option value="TODAY">Today</option><option value="WEEK">Last 7 Days</option><option value="MONTH">Last 30 Days</option></select>
    </form>
    {result.data && <div className="overflow-hidden rounded-2xl border border-brand-slate/10 bg-white shadow-2xs"><div className="overflow-x-auto"><table className="w-full min-w-[950px] text-left text-xs text-brand-navy">
      <thead className="border-b border-brand-slate/10 bg-brand-light/50 text-[11px] font-bold uppercase tracking-wider text-brand-slate"><tr>{["Property Listing", "Property Type", "Property Owner", "Boosting Plan", "Amount", "Payment / Boost Status", "Actions"].map(label => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead>
      <tbody className="divide-y divide-brand-slate/10">{result.data.items.map(row => <tr key={row.property_boosting_id} className="hover:bg-brand-light/20">
        <td className="px-4 py-3"><button type="button" onClick={() => setSelected(row.property_boosting_id)} className="max-w-[170px] truncate text-left font-bold hover:underline">{row.property_title}</button><p className="mt-1 text-[10px] text-brand-slate break-all">{row.property_boosting_id}</p></td>
        <td className="px-3 py-3 capitalize">{row.property_type}</td><td className="px-3 py-3 font-semibold">{row.owner_firstname} {row.owner_lastname}</td>
        <td className="px-3 py-3"><p className="font-semibold">{row.plan_name}</p><p className="text-brand-slate">{row.quoted_duration_days ?? row.plan_duration_days} days</p><p className="text-[10px] text-brand-slate">{row.payment?.reference ?? "No payment reference recorded"}</p></td>
        <td className="px-3 py-3 font-bold">{row.payment ? amountLabel(row.payment.amount, row.payment.currency) : amountLabel(row.amount_due ?? row.plan_price, row.quoted_currency ?? row.plan_currency)}<p className="text-[10px] font-normal text-brand-slate">{row.payment ? "Submitted payment" : row.amount_due !== null ? "Quoted price" : "Current plan price"}</p></td>
        <td className="px-3 py-3"><p className="font-semibold">{paymentLabels[row.payment_status]}</p><p className="text-brand-slate capitalize">Boost: {row.boost_status}</p><p className="text-[10px] text-brand-slate capitalize">Property moderation: {row.property_status}</p></td>
        <td className="px-4 py-3"><div className="flex gap-2"><button type="button" disabled title="Payment review and activation are unavailable until the payment workflow is finalized" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 opacity-40 cursor-not-allowed"><CheckCircle2 className="h-3.5 w-3.5" />Approve</button><button type="button" disabled title="Payment review and activation are unavailable until the payment workflow is finalized" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-700 bg-rose-50 opacity-40 cursor-not-allowed"><XCircle className="h-3.5 w-3.5" />Reject</button></div></td>
      </tr>)}</tbody>
    </table>{!result.data.items.length && <EmptyState>No boost requests match these filters.</EmptyState>}</div><Pagination page={page} pageSize={size} total={result.data.total} onPage={setPage} onPageSize={next => { setSize(next); setPage(1); }} /></div>}
    {selected && <AdminModal title="Boost & Payment Details" onClose={() => setSelected(null)}><QueryState loading={detail.loading} error={detail.error} retry={detail.reload} />
      {detail.data && <><p className="text-xs text-brand-slate break-all">{detail.data.property_boosting_id}</p><dl className="space-y-3 text-xs">
        {Object.entries({          
Listing: detail.data.property_title, "Property type": detail.data.property_type, Owner: `${detail.data.owner_firstname} ${detail.data.owner_lastname}`, "Owner email": detail.data.owner_email, Plan: detail.data.plan_name,
          "Current plan price": amountLabel(detail.data.plan_price, detail.data.plan_currency), "Current plan duration": `${detail.data.plan_duration_days} days`,
          "Quoted price": amountLabel(detail.data.amount_due, detail.data.quoted_currency), "Quoted duration": detail.data.quoted_duration_days === null ? "Not recorded" : `${detail.data.quoted_duration_days} days`,
          "Payment amount": detail.data.payment ? amountLabel(detail.data.payment.amount, detail.data.payment.currency) : detail.data.payment_status === "legacy_unrecorded" ? "Legacy payment amount not recorded" : "No payment submitted",
          "Payment reference": detail.data.payment?.reference ?? "Not recorded", "Payment status": paymentLabels[detail.data.payment_status], "Boost status": detail.data.boost_status,
          "Property moderation": detail.data.property_status, "Requested": dateLabel(detail.data.created_at), "Payment submitted": dateLabel(detail.data.payment?.submitted_at),
          "Start date": dateLabel(detail.data.start_date), "End date": dateLabel(detail.data.end_date)        
}).map(([label, value]) => <div key={label}><dt className="text-brand-slate">{label}</dt><dd className="font-medium break-words">{value}</dd></div>)}
      </dl>{detail.data.payment?.rejection_reason && <p className="text-xs">Recorded rejection reason: {detail.data.payment.rejection_reason}</p>}<p className="text-xs text-brand-slate border-t border-brand-slate/10 pt-4">Payment decisions are unavailable while the Host submission and secure Admin decision workflow are being finalized.</p></>}
    </AdminModal>}
  </div>;
}

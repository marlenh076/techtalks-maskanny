"use client";
import { useCallback, useState } from "react";
import Image from "next/image";
import { Check, X, Building, Edit2 } from "lucide-react";
import type { ModerationPropertySummary, ModerationPropertyDetails } from "@/src/features/properties/models/property_moderation.model";
import { adminApi } from "@/src/features/admin/client/api";
import { useAdminAction, useAdminQuery } from "@/src/features/admin/client/hooks";
import { dateLabel, propertyStatus } from "@/src/features/admin/client/format";
import ContactOwnerButton from "./ContactOwner";
import EditListingModal from "./ListingsEdit";
import { AdminModal, EmptyState, QueryState, buttonClass, inputClass } from "./AdminUI";

function Decision({ detail, decision, onClose, onCompleted }: { detail: ModerationPropertyDetails; decision: "approve" | "reject"; onClose: () => void; onCompleted: (message: string) => void; }) {
  const [reason, setReason] = useState(""); const action = useAdminAction();
  return <AdminModal title={decision === "approve" ? "Approve property moderation" : "Reject property"} onClose={onClose} busy={action.pending}>
    <p className="text-sm font-semibold">{detail.property.title}</p>
    <p className="text-xs text-brand-slate">{decision === "approve" ? "Approval changes moderation status only. The property stays hidden until it has a paid, valid active boost." : "Provide the reason for rejecting this listing. This decision is recorded in the audit history."}</p>
    <form className="space-y-4" onSubmit={async event => { event.preventDefault(); const result = await action.run(() => decision === "approve" ? adminApi.approve(detail.property.property_id) : adminApi.reject(detail.property.property_id, reason)); if (result.ok) onCompleted(result.value.message); }}>
      {decision === "reject" && <label className="block text-xs font-bold">Rejection reason<textarea required maxLength={1000} value={reason} onChange={event => setReason(event.target.value)} className={inputClass + " mt-2"} /></label>}
      <QueryState error={action.error} />
      <div className="flex justify-end gap-2"><button type="button" disabled={action.pending} onClick={onClose} className="px-4 py-2 text-xs font-bold">Cancel</button><button disabled={action.pending || (decision === "reject" && !reason.trim())} className={buttonClass}>{action.pending ? "Saving…" : decision === "approve" ? "Approve moderation" : "Reject listing"}</button></div>
    </form>
  </AdminModal>;
}
export default function RecentSubmissions({ submissions, total = submissions.length, isReadOnly = false, onChanged, onViewAll }: {
  submissions: ModerationPropertySummary[]; total?: number; isReadOnly?: boolean; onChanged?: (message: string) => void; onViewAll?: () => void;
}) {
  const [selected, setSelected] = useState<{ id: string; kind: "detail" | "edit" | "approve" | "reject" ;} | null>(null);
  const [message, setMessage] = useState("");
  const id = selected?.id;
  const load = useCallback((signal: AbortSignal) => id ? adminApi.property(id, signal) : Promise.reject(new Error("Choose a property.")), [id]);
  const detail = useAdminQuery(id ?? null, load);
  function completed(text: string) { if (onChanged) onChanged(text); else setMessage(text); setSelected(null); }
  return <div className="bg-white rounded-2xl border border-brand-slate/15 shadow-sm overflow-hidden flex-1 w-full min-w-0">
    <div className="p-4 sm:p-5 border-b border-brand-slate/10 flex items-center justify-between">
      <div><h3 className="font-bold text-brand-navy text-sm sm:text-base">Property Submissions</h3><p className="text-xs text-brand-slate">Showing {submissions.length} of {total.toLocaleString()} entries</p></div>
      {onViewAll && <button type="button" onClick={onViewAll} className="!text-sm font-semibold px-3 py-1.5 rounded-lg bg-brand-light hover:bg-brand-navy hover:text-white transition-colors duration-200 cursor-pointer">View All</button>}
    </div>
    {message && <p role="status" className="p-3 text-sm text-emerald-700">{message}</p>}
    <div className="w-full max-w-full overflow-x-auto overscroll-x-contain"><table className={`w-full text-left text-xs sm:text-sm text-brand-navy border-collapse ${isReadOnly ? "" : "table-fixed min-w-[822px]"}`}>
      {!isReadOnly && <colgroup><col className="w-[205px]" /><col className="w-[91px]" /><col className="w-[100px]" /><col className="w-[80px]" /><col className="w-[126px]" /><col className="w-[220px]" /></colgroup>}
      <thead className="bg-brand-light/50 border-b border-brand-slate/10 text-[11px] font-bold text-brand-slate uppercase tracking-wider"><tr>
        <th className="py-3 px-4">Property</th><th className={`py-3 px-2 ${isReadOnly ? "hidden md:table-cell" : ""}`}>Type</th><th className="py-3 px-2">Host</th><th className="py-3 px-2">Price</th><th className="py-3 px-2">Status</th>{!isReadOnly && <th className="py-3 px-4 text-right">Actions</th>}
      </tr></thead>
      <tbody className="divide-y divide-brand-slate/10">{submissions.map(row => <tr key={row.property_id} className="hover:bg-brand-light/30 transition-colors">
        <td className="py-3 px-4"><div className={`flex items-center gap-3 ${isReadOnly ? "" : "min-w-0"}`}><div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-brand-slate/15 shrink-0">
          {row.cover_image ? <Image unoptimized src={row.cover_image} alt="" fill sizes="44px" className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><Building className="w-5 h-5" /></div>}
        </div><button type="button" onClick={() => setSelected({ id: row.property_id, kind: "detail" })} title={row.title} className={isReadOnly ? "font-semibold max-w-[180px] truncate text-left hover:underline" : "font-semibold block min-w-0 max-w-full truncate text-left hover:underline"}>{row.title}</button></div></td>
        <td className={`py-3 px-2 ${isReadOnly ? "hidden md:table-cell" : ""}`}><span className="px-2.5 py-1 rounded-md text-[11px] bg-slate-100 capitalize">{row.property_type}</span></td>
        <td className="py-3 px-2 text-brand-slate">{isReadOnly ? [row.host.firstname, row.host.lastname].join(" ") : <span className="block truncate" title={[row.host.firstname, row.host.lastname].join(" ")}>{[row.host.firstname, row.host.lastname].join(" ")}</span>}</td>
        <td className="py-3 px-2 font-semibold whitespace-nowrap">${row.price.toLocaleString()}<span className="text-[10px] font-normal text-brand-slate">/mo</span></td>
        <td className="py-3 px-2"><span className={`inline-flex ${isReadOnly ? "" : "whitespace-nowrap"} px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${row.is_live ? "bg-emerald-50 text-emerald-700 border-emerald-200" : row.approval_status === "rejected" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>{propertyStatus(row)}</span>{row.request_type === "renewal" && <p className="text-[10px] text-brand-slate mt-1">Pending boost renewal</p>}</td>
        {!isReadOnly && <td className="py-3 px-4 text-right"><div className="flex flex-wrap items-center justify-end gap-1.5">
          <ContactOwnerButton owner={{ name: [row.host.firstname, row.host.lastname].join(" "), phone: row.host.phone, email: row.host.email }} listingId={row.property_id} />
          <button type="button" onClick={() => setSelected({ id: row.property_id, kind: "edit" })} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-brand-light border border-brand-slate/15"><Edit2 className="w-3.5 h-3.5" />Edit</button>
          {row.approval_status === "pending" ? <>
            <button type="button" onClick={() => setSelected({ id: row.property_id, kind: "approve" })} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200"><Check className="w-3.5 h-3.5" />Approve</button>
            <button type="button" onClick={() => setSelected({ id: row.property_id, kind: "reject" })} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200"><X className="w-3.5 h-3.5" />Reject</button>
          </> : <span className="text-xs text-brand-slate italic">Moderation recorded</span>}
        </div></td>}
      </tr>)}</tbody>
    </table>{submissions.length === 0 && <EmptyState>No listings match these filters.</EmptyState>}</div>
    {selected && (!detail.data || detail.loading || detail.error) && <AdminModal title="Property details" onClose={() => setSelected(null)}><QueryState loading={detail.loading} error={detail.error} retry={detail.reload} /></AdminModal>}
    {selected && detail.data && selected.kind === "edit" && <EditListingModal listing={detail.data.property} onClose={() => setSelected(null)} onSaved={() => completed("Listing updated.")} />}
    {selected && detail.data && (selected.kind === "approve" || selected.kind === "reject") && <Decision detail={detail.data} decision={selected.kind} onClose={() => setSelected(null)} onCompleted={completed} />}
    {selected && detail.data && selected.kind === "detail" && <AdminModal title="Property details" onClose={() => setSelected(null)}>
      <h4 className="font-bold">{detail.data.property.title}</h4>
      <p className="text-xs text-brand-slate break-all">{detail.data.property.property_id}</p>
      <p className="text-sm">{detail.data.property.description}</p>
      <dl className="grid grid-cols-2 gap-3 text-xs">{Object.entries({ Type: detail.data.property.property_type, Price: detail.data.property.price, Moderation: detail.data.property.approval_status, Submitted: dateLabel(detail.data.property.created_at), Address: detail.data.property.address, Boost: detail.data.boost?.status ?? "No current boost" }).map(([label, value]) => <div key={label}><dt className="text-brand-slate">{label}</dt><dd className="font-semibold">{value}</dd></div>)}</dl>
      <ContactOwnerButton owner={{ name: [detail.data.host.firstname, detail.data.host.lastname].join(" "), phone: detail.data.host.phone, email: detail.data.host.email }} listingId={selected.id} />
      <h4 className="text-xs font-bold uppercase">Moderation history</h4>
      {detail.data.history.length ? detail.data.history.map(entry => <div key={entry.activity_id} className="text-xs border-t border-brand-slate/10 pt-2"><p>{entry.action} · {dateLabel(entry.created_at)}</p>{entry.reason && <p className="text-brand-slate">{entry.reason}</p>}</div>) : <p className="text-xs text-brand-slate">No recorded Admin actions.</p>}
    </AdminModal>}
  </div>;
}

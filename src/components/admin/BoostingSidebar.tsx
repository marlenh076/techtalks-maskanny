"use client";
import { useCallback, useMemo, useState } from "react";
import { Search, CheckCircle2, XCircle } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { adminApi, queryString } from "@/src/features/admin/client/api";
import { useAdminAction, useAdminQuery } from "@/src/features/admin/client/hooks";
import {
  amountLabel,
  dateLabel,
  dateRange,
  paymentLabels,
} from "@/src/features/admin/client/format";
import { AdminModal, EmptyState, Pagination, QueryState, buttonClass, inputClass } from "./AdminUI";
export default function BoostingPlansView() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [payment, setPayment] = useState("");
  const [boost, setBoost] = useState("");
  const [preset, setPreset] = useState("ALL");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(25);
  const [selected, setSelected] = useState<string | null>(null);
  const [decision, setDecision] = useState<"approved" | "rejected" | null>(null);
  const [confirmedReference, setConfirmedReference] = useState("");
  const [whishConfirmed, setWhishConfirmed] = useState(false);
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState("");
  const action = useAdminAction();
  const range = useMemo(
    () => (preset === "ALL" ? {} : dateRange(preset as "TODAY" | "WEEK" | "MONTH")),
    [preset],
  );
  const key = queryString({
    ...range,
    page,
    page_size: size,
    query,
    payment_status: payment,
    boost_status: boost,
  });
  const load = useCallback(
    (signal: AbortSignal) => adminApi.boosts(Object.fromEntries(new URLSearchParams(key)), signal),
    [key],
  );
  const result = useAdminQuery(key, load);
  const detailLoad = useCallback(
    (signal: AbortSignal) =>
      selected
        ? adminApi.boost(selected, signal)
        : Promise.reject(new Error("Choose a boost request.")),
    [selected],
  );
  const detail = useAdminQuery(selected, detailLoad);
  function openDecision(id: string, next: "approved" | "rejected" | null) {
    setSelected(id);
    setDecision(next);
    setConfirmedReference("");
    setWhishConfirmed(false);
    setReason("");
    setNotice("");
  }
  async function submitDecision() {
    const paymentRecord = detail.data?.payment;
    if (!selected || !decision || detail.data?.review_status !== "pending") return;
    const outcome = await action.run(() =>
      adminApi.decideBoostPayment(
        selected,
        decision === "approved"
          ? {
              decision,
              payment_id:
                paymentRecord?.status === "pending" || paymentRecord?.status === "verified"
                  ? paymentRecord.payment_id
                  : null,
              reference: confirmedReference,
              whish_confirmed: whishConfirmed,
            }
          : {
              decision,
              payment_id: paymentRecord?.status === "pending" ? paymentRecord.payment_id : null,
              reference: paymentRecord?.status === "pending" ? paymentRecord.reference : null,
              whish_confirmed: false,
              reason,
            },
      ),
    );
    if (outcome.ok) {
      setNotice(outcome.value.message);
      setSelected(null);
      setDecision(null);
      result.reload();
    } else {
      detail.reload();
      result.reload();
    }
  }
  return (
    <div className="space-y-6">
      {notice && (
        <p
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800"
        >
          {notice}
        </p>
      )}
      <QueryState loading={result.loading} error={result.error} retry={result.reload} />
      {result.data && (
        <>
          <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-3">
            <MetricCard
              title="Pending Payments"
              value={result.data.payment_counts.pending.toLocaleString()}
              subtitle="Awaiting verification"
            />
            <MetricCard
              title="Verified Payments"
              value={result.data.payment_counts.verified.toLocaleString()}
            />
            <MetricCard
              title="Rejected Payments"
              value={result.data.payment_counts.rejected.toLocaleString()}
            />
          </div>
          <p className="text-xs text-brand-slate">
            Counts cover the latest payment attempt for each boost, across all filters.{" "}
            {result.data.payment_counts.not_submitted} requests have no submitted payment;{" "}
            {result.data.payment_counts.legacy_unrecorded} legacy payments have no recorded transfer
            details.
          </p>
        </>
      )}
      <p className="rounded-xl border border-brand-slate/15 bg-white p-4 text-xs text-brand-slate">
        Confirm the transfer in Whish against the available evidence, amount and selected property
        before approving. Approval verifies payment and activates the selected boost. Property
        moderation approval remains separate.
      </p>
      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          setQuery(search.trim());
          setPage(1);
        }}
      >
        <div className="relative min-w-48 flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-slate" />
          <input
            aria-label="Search boost requests"
            value={search}
            maxLength={200}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search listings, owners, references…"
            className={inputClass + " !py-1.5 !pl-8 !text-xs"}
          />
        </div>
        <button className={buttonClass + " !px-2.5 !py-1.5 [&]:!text-xs"}>Search</button>
        <select
          aria-label="Filter by payment status"
          value={payment}
          onChange={(event) => {
            setPayment(event.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-brand-slate/15 bg-white !px-2.5 !py-1.5 !text-xs"
        >
          <option value="">All payment statuses</option>
          {Object.entries(paymentLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by boost status"
          value={boost}
          onChange={(event) => {
            setBoost(event.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-brand-slate/15 bg-white !px-2.5 !py-1.5 !text-xs"
        >
          <option value="">All boost statuses</option>
          {["pending", "active", "expired", "rejected"].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select
          aria-label="Request submission date"
          value={preset}
          onChange={(event) => {
            setPreset(event.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-brand-slate/15 bg-white !px-2.5 !py-1.5 !text-xs"
        >
          <option value="ALL">All Time</option>
          <option value="TODAY">Today</option>
          <option value="WEEK">Last 7 Days</option>
          <option value="MONTH">Last 30 Days</option>
        </select>
      </form>
      {result.data && (
        <div className="overflow-hidden rounded-2xl border border-brand-slate/10 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-xs text-brand-navy">
              <thead className="border-b border-brand-slate/10 bg-brand-light/50 text-[11px] font-bold uppercase tracking-wider text-brand-slate">
                <tr>
                  {[
                    "Property Listing",
                    "Property Type",
                    "Property Owner",
                    "Boosting Plan",
                    "Amount",
                    "Payment / Boost Status",
                    "Actions",
                  ].map((label) => (
                    <th key={label} className="px-4 py-3">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-slate/10">
                {result.data.items.map((row) => (
                  <tr key={row.property_boosting_id} className="hover:bg-brand-light/20">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openDecision(row.property_boosting_id, null)}
                        className="max-w-[170px] truncate text-left font-bold hover:underline"
                      >
                        {row.property_title}
                      </button>
                      <p className="mt-1 text-[10px] text-brand-slate break-all">
                        {row.property_boosting_id}
                      </p>
                    </td>
                    <td className="px-3 py-3 capitalize">{row.property_type}</td>
                    <td className="px-3 py-3 font-semibold">
                      {row.owner_firstname} {row.owner_lastname}
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-semibold">{row.plan_name}</p>
                      <p className="text-brand-slate">
                        {row.quoted_duration_days ?? row.plan_duration_days} days
                      </p>
                      <p className="text-[10px] text-brand-slate">
                        {row.payment?.reference ?? "No payment reference recorded"}
                      </p>
                    </td>
                    <td className="px-3 py-3 font-bold">
                      {row.payment
                        ? amountLabel(row.payment.amount, row.payment.currency)
                        : amountLabel(
                            row.amount_due ?? row.plan_price,
                            row.quoted_currency ?? row.plan_currency,
                          )}
                      <p className="text-[10px] font-normal text-brand-slate">
                        {row.payment
                          ? row.payment.submitted_by === row.owner_user_id
                            ? "Host payment claim"
                            : "Admin-recorded transfer"
                          : row.amount_due !== null
                            ? "Quoted price"
                            : "Current plan price"}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-semibold">{paymentLabels[row.payment_status]}</p>
                      <p className="text-brand-slate capitalize">Boost: {row.boost_status}</p>
                      <p className="text-[10px] text-brand-slate capitalize">
                        Property moderation: {row.property_status}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {row.review_status === "approved" && (
                        <span className="inline-flex rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 font-semibold text-emerald-700">
                          Accepted
                        </span>
                      )}
                      {row.review_status === "rejected" && (
                        <span className="inline-flex rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 font-semibold text-rose-700">
                          Rejected
                        </span>
                      )}
                      {row.review_status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openDecision(row.property_boosting_id, "approved")}
                            disabled={
                              row.property_status !== "approved" ||
                              row.boost_status !== "pending" ||
                              !["not_submitted", "pending", "verified", "rejected"].includes(
                                row.payment_status,
                              )
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 disabled:opacity-40"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => openDecision(row.property_boosting_id, "rejected")}
                            disabled={
                              row.boost_status !== "pending" ||
                              !["not_submitted", "pending", "rejected"].includes(row.payment_status)
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-700 bg-rose-50 disabled:opacity-40"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!result.data.items.length && (
              <EmptyState>No boost requests match these filters.</EmptyState>
            )}
          </div>
          <Pagination
            page={page}
            pageSize={size}
            total={result.data.total}
            onPage={setPage}
            onPageSize={(next) => {
              setSize(next);
              setPage(1);
            }}
          />
        </div>
      )}
      {selected && (
        <AdminModal
          title="Boost & Payment Details"
          onClose={() => setSelected(null)}
          busy={action.pending}
        >
          <QueryState loading={detail.loading} error={detail.error} retry={detail.reload} />
          {detail.data && (
            <>
              <p className="text-xs text-brand-slate break-all">
                {detail.data.property_boosting_id}
              </p>
              <dl className="space-y-3 text-xs">
                {Object.entries({
                  Listing: detail.data.property_title,
                  "Property type": detail.data.property_type,
                  Owner: `${detail.data.owner_firstname} ${detail.data.owner_lastname}`,
                  "Owner email": detail.data.owner_email,
                  Plan: detail.data.plan_name,
                  "Current plan price": amountLabel(
                    detail.data.plan_price,
                    detail.data.plan_currency,
                  ),
                  "Current plan duration": `${detail.data.plan_duration_days} days`,
                  "Quoted price": amountLabel(detail.data.amount_due, detail.data.quoted_currency),
                  "Quoted duration":
                    detail.data.quoted_duration_days === null
                      ? "Not recorded"
                      : `${detail.data.quoted_duration_days} days`,
                  "Payment amount": detail.data.payment
                    ? amountLabel(detail.data.payment.amount, detail.data.payment.currency)
                    : detail.data.payment_status === "legacy_unrecorded"
                      ? "Legacy payment amount not recorded"
                      : "No payment submitted",
                  "Payment reference": detail.data.payment?.reference ?? "Not recorded",
                  "Payment status": paymentLabels[detail.data.payment_status],
                  "Boost status": detail.data.boost_status,
                  "Property moderation": detail.data.property_status,
                  Requested: dateLabel(detail.data.created_at),
                  "Payment recorded": dateLabel(detail.data.payment?.submitted_at),
                  "Start date": dateLabel(detail.data.start_date),
                  "End date": dateLabel(detail.data.end_date),
                }).map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-brand-slate">{label}</dt>
                    <dd className="font-medium break-words">{value}</dd>
                  </div>
                ))}
              </dl>
              {detail.data.payment?.rejection_reason && (
                <p className="text-xs">
                  Recorded rejection reason: {detail.data.payment.rejection_reason}
                </p>
              )}
              {detail.data.payment?.receipt_url && (
                <a
                  href={detail.data.payment.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-brand-navy underline"
                >
                  Open private payment receipt
                </a>
              )}
              {detail.data.payment && !detail.data.payment.receipt_url && (
                <p className="text-xs text-brand-slate">
                  {detail.data.payment.receipt_path
                    ? "Receipt cannot be opened. Check the Whish transaction records directly."
                    : "No receipt attached. Check the Whish transaction records directly."}
                </p>
              )}
              {decision === "approved" && (
                <div className="space-y-3 border-t border-brand-slate/10 pt-4 text-xs">
                  <p>
                    Check the Maskanny Whish account for the matching transfer. Record its
                    transaction reference and confirm{" "}
                    {amountLabel(
                      detail.data.amount_due ?? detail.data.plan_price,
                      detail.data.quoted_currency ?? detail.data.plan_currency,
                    )}{" "}
                    for this property.
                  </p>
                  <input
                    aria-label="Confirmed Whish transaction reference"
                    className={inputClass}
                    value={confirmedReference}
                    maxLength={100}
                    onChange={(event) => setConfirmedReference(event.target.value)}
                  />
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={whishConfirmed}
                      onChange={(event) => setWhishConfirmed(event.target.checked)}
                    />
                    <span>
                      I confirmed the real Whish transfer, amount, currency and selected property.
                    </span>
                  </label>
                  <button
                    type="button"
                    className={buttonClass}
                    disabled={
                      action.pending ||
                      detail.data.review_status !== "pending" ||
                      detail.data.property_status !== "approved" ||
                      detail.data.boost_status !== "pending" ||
                      !whishConfirmed ||
                      ((detail.data.payment?.status === "pending" ||
                        detail.data.payment?.status === "verified") &&
                        detail.data.payment.reference !== null &&
                        confirmedReference.trim() !== detail.data.payment.reference) ||
                      confirmedReference.trim().length < 3
                    }
                    onClick={submitDecision}
                  >
                    Verify payment and activate boost
                  </button>
                </div>
              )}
              {decision === "rejected" && (
                <div className="space-y-3 border-t border-brand-slate/10 pt-4 text-xs">
                  <label className="block">
                    Reason for{" "}
                    {detail.data.payment?.status === "pending" ? "payment" : "boost request"}{" "}
                    rejection
                    <textarea
                      className={inputClass + " mt-1 w-full"}
                      value={reason}
                      maxLength={1000}
                      onChange={(event) => setReason(event.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    className={buttonClass}
                    disabled={
                      action.pending ||
                      detail.data.review_status !== "pending" ||
                      detail.data.boost_status !== "pending" ||
                      !reason.trim()
                    }
                    onClick={submitDecision}
                  >
                    Reject {detail.data.payment?.status === "pending" ? "payment" : "boost request"}
                  </button>
                </div>
              )}
              {action.error && (
                <p role="alert" className="text-xs text-rose-700">
                  {action.error}
                </p>
              )}
            </>
          )}
        </AdminModal>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Copy, Rocket, Video, Wallet, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { LogoutAction } from "@/src/components/auth/LogoutAction";
import { supabase } from "@/src/lib/supabase/client";
import {
  hostRequest,
  loadHostListings,
} from "@/src/features/properties/presentation/host-listings.api";
import type { HostListing } from "@/src/features/properties/presentation/host-listings";
import type { BoostingPlan } from "@/src/features/boosting/models/boosting_plan.model";
import type { PropertyBoosting } from "@/src/features/boosting/models/property_boosting.model";

type PaymentStatus = {
  payment_id: string;
  status: "pending" | "verified" | "rejected";
  reference: string | null;
  amount: number;
  currency: string;
  submitted_at: string;
  rejection_reason: string | null;
};

const maxReceiptSize = 5 * 1024 * 1024;
const referencePattern = /^[A-Za-z0-9][A-Za-z0-9 /_-]{2,99}$/;
const whishNumber =
  process.env.NEXT_PUBLIC_WHISH_RECIPIENT_VERIFIED === "true"
    ? (process.env.NEXT_PUBLIC_WHISH_RECIPIENT?.trim() ?? "")
    : "";

function amount(price: number, currency: string | null) {
  if (!currency) return "Price unavailable";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(price);
  } catch {
    return "Price unavailable";
  }
}

function planFeatures(plan: BoostingPlan) {
  return [
    `${plan.duration_days} days of boosted visibility`,
    plan.top_placement ? "Higher position in search results" : "Top placement not included",
    `Up to ${plan.max_images} listing images`,
    plan.video_enabled ? "Video included" : "No video included",
  ];
}

function validPlan(plan: BoostingPlan) {
  return (
    !!plan.currency &&
    /^[A-Z]{3}$/.test(plan.currency) &&
    plan.price > 0 &&
    plan.duration_days > 0 &&
    plan.max_images >= 0
  );
}

export default function BoostingPage() {
  const router = useRouter();

  const [plans, setPlans] = useState<BoostingPlan[]>([]);
  const [listings, setListings] = useState<HostListing[]>([]);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [requestedPropertyId, setRequestedPropertyId] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [reference, setReference] = useState("");
  const [payment, setPayment] = useState<PaymentStatus | null>(null);
  const [paymentBoostId, setPaymentBoostId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentTransition, setPaymentTransition] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedListing = listings.find((listing) => listing.property.property_id === propertyId);
  const boost = selectedListing?.boost;
  const boostId = boost?.property_boosting_id;
  const selected = plans.find(
    (plan) => plan.boosting_plan_id === (boost?.boosting_plan_id ?? selectedPlan),
  );
  const eligibleListings = listings.filter(
    (listing) =>
      listing.property.approval_status === "approved" &&
      (listing.relatedData.boost === "unavailable" ||
        !listing.boost ||
        listing.boost.status === "pending"),
  );
  const bestValueId = useMemo(() => {
    const configured = plans.filter(validPlan);
    if (configured.length < 2 || new Set(configured.map((plan) => plan.currency)).size !== 1)
      return undefined;
    return configured.sort((a, b) => a.price / a.duration_days - b.price / b.duration_days)[0]
      .boosting_plan_id;
  }, [plans]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) throw new Error("Sign in as a Host to request a boost.");
        const [owned, availablePlans] = await Promise.all([
          loadHostListings(session.access_token),
          hostRequest<BoostingPlan[]>("/api/boosting_plans", session.access_token),
        ]);
        if (cancelled) return;
        const requested = new URLSearchParams(window.location.search).get("property_id");
        setToken(session.access_token);
        setListings(owned);
        setPlans(availablePlans);
        setSelectedPlan(availablePlans.find(validPlan)?.boosting_plan_id ?? "");
        setRequestedPropertyId(requested);
        if (requested) {
          setPropertyId(requested);
          if (!owned.some((listing) => listing.property.property_id === requested)) {
            setError("The selected property is not in your listings.");
          }
        }
      } catch (cause) {
        if (!cancelled)
          setError(cause instanceof Error ? cause.message : "Could not load boosting details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!token || !boostId) return;
    let cancelled = false;
    void Promise.resolve().then(async () => {
      if (cancelled) return;
      setPaymentLoading(true);
      setPayment(null);
      setPaymentBoostId(null);
      try {
        const result = await hostRequest<{ payment: PaymentStatus | null }>(
          `/api/property_boosting/${encodeURIComponent(boostId)}/payment`,
          token,
        );
        if (!cancelled) {
          setPayment(result.payment);
          setPaymentBoostId(boostId);
        }
      } catch (cause) {
        if (!cancelled)
          setError(cause instanceof Error ? cause.message : "Could not load payment status.");
      } finally {
        if (!cancelled) setPaymentLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [token, boostId]);

  const copyWhishNumber = async () => {
    if (!whishNumber) return;
    try {
      await navigator.clipboard.writeText(whishNumber);
    } catch {
      setError("Could not copy the Whish recipient.");
      return;
    }
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  async function continueToPayment() {
    setError(null);
    if (!selectedListing || selectedListing.property.approval_status !== "approved") {
      setError("Select an approved property you own.");
      return;
    }
    if (selectedListing.relatedData.boost === "unavailable") {
      setError("Boost status could not be loaded. Refresh the page before requesting a boost.");
      return;
    }
    if (!selected || !validPlan(selected)) {
      setError("Select an available boosting plan.");
      return;
    }
    if (boost && boost.status !== "pending") {
      setError("This property already has a current boost.");
      return;
    }
    if (!boost) {
      setBusy(true);
      try {
        const created = await hostRequest<PropertyBoosting>("/api/property_boosting", token, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            property_id: propertyId,
            boosting_plan_id: selected.boosting_plan_id,
          }),
        });
        setListings((current) =>
          current.map((listing) =>
            listing.property.property_id === propertyId ? { ...listing, boost: created } : listing,
          ),
        );
      } catch (cause) {
        try {
          const refreshed = await loadHostListings(token);
          setListings(refreshed);
          const current = refreshed.find(
            (listing) => listing.property.property_id === propertyId,
          )?.boost;
          if (current?.status === "pending") {
            setBusy(false);
            setShowPayment(true);
            setTimeout(() => setPaymentTransition(true), 50);
            return;
          }
        } catch {
          /* Preserve the original request error when refresh fails. */
        }
        setError(cause instanceof Error ? cause.message : "Could not request a boost.");
        setBusy(false);
        return;
      }
      setBusy(false);
    }
    setShowPayment(true);
    setTimeout(() => setPaymentTransition(true), 50);
  }

  function selectReceipt(file: File | null) {
    setReceipt(null);
    setError(null);
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "application/pdf"].includes(file.type) ||
      file.size === 0 ||
      file.size > maxReceiptSize
    ) {
      setError("Upload a JPEG, PNG or PDF receipt up to 5 MiB.");
      return;
    }
    setReceipt(file);
  }

  async function submitPayment() {
    setError(null);
    if (
      !boost ||
      boost.status !== "pending" ||
      !token ||
      paymentLoading ||
      paymentBoostId !== boostId ||
      payment?.status === "pending" ||
      payment?.status === "verified"
    )
      return;
    if (!whishNumber) {
      setError("Whish payment instructions are unavailable. Do not send a transfer yet.");
      return;
    }
    if (reference.trim() && !referencePattern.test(reference.trim())) {
      setError(
        "Use 3–100 letters, numbers, spaces, slashes, underscores or hyphens for the reference.",
      );
      return;
    }
    const form = new FormData();
    if (reference.trim()) form.set("reference", reference.trim());
    if (receipt) form.set("receipt", receipt);
    setBusy(true);
    try {
      const submitted = await hostRequest<PaymentStatus>(
        `/api/property_boosting/${encodeURIComponent(boost.property_boosting_id)}/payment`,
        token,
        { method: "POST", body: form },
      );
      setPayment(submitted);
      setPaymentBoostId(boost.property_boosting_id);
      setReceipt(null);
    } catch (cause) {
      try {
        const current = await hostRequest<{ payment: PaymentStatus | null }>(
          `/api/property_boosting/${encodeURIComponent(boost.property_boosting_id)}/payment`,
          token,
        );
        if (current.payment?.status === "pending" || current.payment?.status === "verified") {
          setPayment(current.payment);
          setPaymentBoostId(boost.property_boosting_id);
          setReceipt(null);
          return;
        }
      } catch {
        /* Show the submission error when status cannot be recovered. */
      }
      setError(cause instanceof Error ? cause.message : "Could not submit payment evidence.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-light px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => router.push("/owner")}
          className="mb-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-navy shadow-sm transition-all hover:border-brand-gold hover:bg-brand-gold/10 hover:shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-brand-navy">Boost Your Listing</h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm text-brand-slate sm:text-base">
            Get your property in front of more students and increase your chances of finding the
            right tenant faster.
          </p>
        </div>

        {loading && (
          <p
            role="status"
            className="mx-auto mb-6 max-w-4xl rounded-xl bg-white p-4 text-sm text-brand-slate shadow-sm"
          >
            Loading your properties and boosting plans…
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="mx-auto mb-6 max-w-4xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        {!loading && token && (
          <div className="mx-auto mb-6 max-w-4xl rounded-2xl bg-white p-5 shadow-sm">
            {requestedPropertyId ? (
              <p className="block text-sm font-semibold text-brand-navy">Property to boost</p>
            ) : (
              <label
                htmlFor="boostProperty"
                className="block text-sm font-semibold text-brand-navy"
              >
                Property to boost
              </label>
            )}
            {requestedPropertyId && selectedListing ? (
              <p className="mt-2 text-sm text-brand-slate">
                {selectedListing.property.title} · {selectedListing.property.approval_status}
              </p>
            ) : requestedPropertyId ? (
              <p className="mt-2 text-sm text-red-700">
                The selected property is not in your listings.
              </p>
            ) : (
              <select
                id="boostProperty"
                value={propertyId}
                onChange={(event) => {
                  setPropertyId(event.target.value);
                  setShowPayment(false);
                  setPaymentTransition(false);
                  setPayment(null);
                  setPaymentBoostId(null);
                  setError(null);
                }}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-brand-navy"
              >
                <option value="">Choose an approved property</option>
                {eligibleListings.map((listing) => (
                  <option key={listing.property.property_id} value={listing.property.property_id}>
                    {listing.property.title}
                    {listing.relatedData.boost === "unavailable"
                      ? " · boost status unavailable"
                      : listing.boost
                        ? " · pending boost"
                        : ""}
                  </option>
                ))}
              </select>
            )}
            {!requestedPropertyId && eligibleListings.length === 0 && (
              <p className="mt-2 text-xs text-brand-slate">
                No approved property is available for a new boost request.
              </p>
            )}
            {selectedListing?.relatedData.boost === "unavailable" && (
              <p role="alert" className="mt-2 text-xs text-amber-800">
                Boost status could not be loaded. Refresh this page before requesting a boost.
              </p>
            )}
            {boost?.status === "active" && (
              <p className="mt-2 text-xs text-brand-slate">
                This property already has an active boost. It cannot be boosted again while active.
              </p>
            )}
            {boost?.status === "pending" && (
              <p className="mt-2 text-xs text-brand-slate">
                This property already has a pending boost request. Continue with that request.
              </p>
            )}
            {selectedListing && selectedListing.property.approval_status !== "approved" && (
              <p className="mt-2 text-xs text-brand-slate">
                Admin must approve this property before it can be boosted.
              </p>
            )}
          </div>
        )}

        {!loading && plans.length > 0 && !plans.some(validPlan) && (
          <p
            role="alert"
            className="mx-auto mb-6 max-w-4xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            Boosting plan prices, currencies or durations need configuration before a request can be
            placed.
          </p>
        )}
        <div className="mx-auto grid max-w-4xl grid gap-6 md:grid-cols-2">
          {!loading && token && plans.length === 0 && (
            <p className="rounded-2xl bg-white p-6 text-sm text-brand-slate shadow-sm">
              No boosting plans are available.
            </p>
          )}
          {plans.map((plan) => {
            const isSelected = selected?.boosting_plan_id === plan.boosting_plan_id;
            const popular = plan.boosting_plan_id === bestValueId;
            const configured = validPlan(plan);

            return (
              <button
                key={plan.boosting_plan_id}
                type="button"
                onClick={() => {
                  setSelectedPlan(plan.boosting_plan_id);
                  setShowPayment(false);
                  setPaymentTransition(false);
                }}
                disabled={!!boost || !configured}
                className={`relative rounded-2xl bg-white p-6 text-left transition-all duration-200 ${
                  isSelected ? "shadow-lg" : "shadow-md hover:shadow-md"
                } disabled:cursor-not-allowed`}
              >
                {popular && (
                  <span className="absolute right-5 top-5 rounded-full bg-brand-gold px-3 py-1 text-xs font-bold text-brand-navy">
                    BEST VALUE
                  </span>
                )}

                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${
                    isSelected ? "bg-brand-gold/20" : "bg-slate-100"
                  }`}
                >
                  <Rocket
                    className={`h-6 w-6 ${isSelected ? "text-brand-navy" : "text-slate-500"}`}
                  />
                </div>

                <h2 className="text-xl font-bold text-brand-navy">{plan.name}</h2>

                <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                  Give your listing a visibility boost and reach more students.
                </p>

                <div className="mt-6 flex items-end gap-2">
                  <span className="text-3xl font-bold text-brand-navy">
                    {amount(plan.price, plan.currency)}
                  </span>

                  <span className="mb-1 text-sm text-slate-500">/ {plan.duration_days} Days</span>
                </div>

                <div className="my-6 border-t border-slate-200" />

                <div className="space-y-3">
                  {planFeatures(plan).map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm text-slate-700">
                      {feature === "Video included" ? (
                        <Video className="h-4 w-4 text-brand-gold" />
                      ) : feature === "No video included" ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-gold/20">
                          <X className="h-3 w-3 text-brand-navy" />
                        </span>
                      ) : (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-gold/20">
                          <Check className="h-3 w-3 text-brand-navy" />
                        </span>
                      )}

                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div
                  className={`mt-7 flex h-11 w-full items-center justify-center rounded-xl text-sm font-bold ${
                    isSelected ? "bg-brand-gold text-brand-navy" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {!configured ? "Unavailable" : isSelected ? "Selected Plan" : "Select Plan"}
                </div>
              </button>
            );
          })}
        </div>

        {!showPayment && (
          <div className="mx-auto mt-8 max-w-3xl rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500">Selected plan</p>

                <p className="font-bold text-brand-navy">
                  {selected
                    ? `${selected.name} — ${amount(selected.price, selected.currency)}`
                    : "Choose a plan"}
                </p>
                {!whishNumber && (
                  <p className="mt-1 text-xs text-red-700">
                    Whish recipient is not verified. Do not send a transfer yet.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => void continueToPayment()}
                disabled={
                  loading ||
                  busy ||
                  !selectedListing ||
                  selectedListing.relatedData.boost === "unavailable" ||
                  selectedListing.property.approval_status !== "approved" ||
                  !selected ||
                  !validPlan(selected) ||
                  (!!boost && boost.status !== "pending")
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-navy px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Wallet className="h-4 w-4" />
                {busy
                  ? "Requesting Boost…"
                  : boost?.status === "pending"
                    ? "Continue Pending Request"
                    : "Continue to Payment"}
              </button>
            </div>
          </div>
        )}

        {showPayment && selected && (
          <div
            className={`mx-auto mt-8 max-w-2xl transition-all duration-500 ease-out ${
              paymentTransition ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
              <div className="bg-brand-navy px-6 py-7 text-white sm:px-8">
                <div className="flex items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold">Complete Your Payment</h2>

                    <p className="mt-1 text-sm text-white/70">
                      {whishNumber
                        ? "After paying through Whish, submit your I've Paid claim for Admin verification."
                        : "Payment instructions are unavailable until the Whish recipient is verified."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6 sm:p-8">
                <div className="rounded-2xl bg-slate-50 p-5 shadow-sm hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Selected Plan
                      </p>

                      <p className="mt-1 text-base font-bold text-brand-navy">{selected.name}</p>

                      <p className="mt-1 text-sm text-slate-500">
                        {selected.duration_days} days of boosted visibility
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-brand-navy">
                        {amount(selected.price, selected.currency)}
                      </p>

                      <p className="text-xs text-slate-500">Total</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                      <img
                        src="/whishmoney.png"
                        alt="Whish Money"
                        className="h-full w-full object-contain p-1"
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-brand-navy">Whish Money</h3>

                      <p className="mt-0.5 text-sm text-slate-500">
                        {whishNumber
                          ? "Send the exact amount to complete your payment."
                          : "Recipient details are unavailable. Do not send a transfer yet."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl bg-white p-5 text-center shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {whishNumber ? "Amount to Send" : "Plan Amount"}
                    </p>

                    <p className="mt-1 text-2xl font-bold text-brand-navy">
                      {amount(selected.price, selected.currency)}
                    </p>
                  </div>

                  <div className="mt-5">
                    <p className="mb-2 text-sm font-semibold text-brand-navy">Whish Money Number</p>

                    <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3.5 shadow-sm">
                      <span className="text-base font-bold tracking-wide text-brand-navy">
                        {whishNumber || "Recipient not configured"}
                      </span>

                      <button
                        type="button"
                        onClick={copyWhishNumber}
                        disabled={!whishNumber}
                        className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-brand-navy transition hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Copy className="h-4 w-4" />
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (whishNumber)
                        window.open(
                          "https://www.whish.money/whish-app",
                          "_blank",
                          "noopener,noreferrer",
                        );
                    }}
                    disabled={!whishNumber}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Wallet className="h-4 w-4" />
                    Open Whish
                  </button>
                </div>

                <div>
                  <h3 className="text-base font-bold text-brand-navy">How it works</h3>

                  <div className="mt-4 space-y-4">
                    {(whishNumber
                      ? [
                          "Open Whish Money.",
                          `Send ${amount(selected.price, selected.currency)} to the Maskanny Whish number.`,
                          "Keep your payment confirmation.",
                          "Return to Maskanny and submit your I've Paid claim. A receipt and reference are optional.",
                        ]
                      : ["Whish recipient is not configured. Do not send a transfer yet."]
                    ).map((step, index) => (
                      <div key={step} className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-gold text-xs font-bold text-brand-navy">
                          {index + 1}
                        </span>

                        <p className="pt-1 text-sm leading-5 text-slate-600">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-6 shadow-sm">
                  <div>
                    <h3 className="text-base font-bold text-brand-navy">Payment Confirmation</h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {payment?.status === "pending"
                        ? "Your payment claim is awaiting Admin verification. Your property remains hidden until the boost is activated."
                        : payment?.status === "verified"
                          ? "Your payment has been verified. Check your listing for boost status."
                          : "After sending the payment, submit your I've Paid claim. A receipt and reference are optional."}
                    </p>
                  </div>

                  {paymentLoading && (
                    <p role="status" className="mt-4 text-sm text-brand-slate">
                      Checking payment status…
                    </p>
                  )}
                  {payment?.status === "pending" && (
                    <p
                      role="status"
                      className="mt-4 rounded-xl bg-brand-gold/15 p-3 text-sm text-brand-navy"
                    >
                      Payment submitted and pending verification.
                    </p>
                  )}
                  {payment?.status === "rejected" && (
                    <p role="status" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                      The previous payment was rejected
                      {payment.rejection_reason ? `: ${payment.rejection_reason}` : "."} Submit a
                      new claim to retry.
                    </p>
                  )}
                  {payment?.status === "verified" && (
                    <p
                      role="status"
                      className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700"
                    >
                      Payment verified by Admin.
                    </p>
                  )}
                  {paymentBoostId !== boostId && !paymentLoading && boost && (
                    <p className="mt-4 text-sm text-red-700">
                      Payment status could not be confirmed. Refresh this page before submitting.
                    </p>
                  )}

                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-semibold text-brand-navy">
                      Payment Screenshot (optional)
                    </label>

                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl bg-white p-6 text-center shadow-sm transition hover:shadow-md">
                      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
                        <Copy className="h-5 w-5 text-brand-navy" />
                      </div>

                      <span className="text-sm font-semibold text-brand-navy">
                        Upload payment confirmation
                      </span>

                      <span className="mt-1 text-xs text-slate-500">
                        PNG, JPG or PDF · maximum 5 MiB
                      </span>

                      {receipt && (
                        <span className="mt-2 text-xs font-semibold text-brand-navy">
                          {receipt.name}
                        </span>
                      )}

                      <input
                        type="file"
                        accept="image/png,image/jpeg,application/pdf"
                        onChange={(event) => selectReceipt(event.target.files?.[0] ?? null)}
                        disabled={
                          busy ||
                          !whishNumber ||
                          paymentBoostId !== boostId ||
                          payment?.status === "pending" ||
                          payment?.status === "verified"
                        }
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="mt-5">
                    <label
                      htmlFor="transactionReference"
                      className="mb-2 block text-sm font-semibold text-brand-navy"
                    >
                      Transaction Reference
                      <span className="ml-1 font-normal text-slate-400">(optional)</span>
                    </label>

                    <input
                      id="transactionReference"
                      type="text"
                      placeholder="Enter your Whish transaction reference"
                      value={reference}
                      maxLength={100}
                      onChange={(event) => setReference(event.target.value)}
                      disabled={
                        busy ||
                        !whishNumber ||
                        paymentBoostId !== boostId ||
                        payment?.status === "pending" ||
                        payment?.status === "verified"
                      }
                      className="w-full rounded-xl bg-white px-4 py-3 text-sm text-brand-navy shadow-sm outline-none transition focus:shadow-md"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => void submitPayment()}
                    disabled={
                      busy ||
                      !boost ||
                      !whishNumber ||
                      paymentBoostId !== boostId ||
                      payment?.status === "pending" ||
                      payment?.status === "verified"
                    }
                    className="w-full rounded-xl bg-brand-navy px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busy
                      ? "Submitting…"
                      : payment?.status === "pending"
                        ? "Pending Verification"
                        : "I've Paid — Submit for Verification"}
                  </button>
                </div>

                <button
                  type="button"
                  disabled={!!boost}
                  onClick={() => {
                    setShowPayment(false);
                    setPaymentTransition(false);
                  }}
                  className="w-full rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-navy shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Change Plan
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-slate-500">
          Your boost will be activated after the payment is verified.
        </p>
        <div className="mt-6 flex justify-end">
          <LogoutAction />
        </div>
      </div>
    </div>
  );
}

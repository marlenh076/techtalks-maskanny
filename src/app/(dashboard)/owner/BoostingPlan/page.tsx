"use client";

import { useState } from "react";
import { ArrowLeft, Check, Copy, Rocket, Video, Wallet, X } from "lucide-react";
import { useRouter } from "next/navigation";

const plans = [
    {
        id: "boost",
        name: "Maskanny Boost",
        duration: "15 Days",
        price: 10,
        description:
            "Give your listing a visibility boost and reach more students.",
        features: [
            "15 days of boosted visibility",
            "Higher position in search results",
            "Boost badge on your listing",
            "No video included",
        ],
    },
    {
        id: "spotlight",
        name: "Maskanny Spotlight",
        duration: "30 Days",
        price: 15,
        description:
            "Keep your listing visible for longer and showcase it with a video.",
        features: [
            "30 days of boosted visibility",
            "Higher position in search results",
            "Boost badge on your listing",
            "Video included",
        ],
        popular: true,
    },
];

export default function BoostingPage() {
    const router = useRouter();

    const [selectedPlan, setSelectedPlan] = useState("spotlight");
    const [showPayment, setShowPayment] = useState(false);
    const [paymentTransition, setPaymentTransition] = useState(false);
    const [copied, setCopied] = useState(false);

    const selected = plans.find((plan) => plan.id === selectedPlan);


    const whishNumber = "70 123 456";

    const copyWhishNumber = async () => {
        await navigator.clipboard.writeText(whishNumber);
        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

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

                    <h1 className="text-3xl font-bold text-brand-navy">
                        Boost Your Listing
                    </h1>

                    <p className="mx-auto mt-3 max-w-2xl text-sm text-brand-slate sm:text-base">
                        Get your property in front of more students and increase your
                        chances of finding the right tenant faster.
                    </p>
                </div>


                <div className="mx-auto grid max-w-4xl grid gap-6 md:grid-cols-2">
                    {plans.map((plan) => {
                        const isSelected = selectedPlan === plan.id;

                        return (
                            <button
                                key={plan.id}
                                type="button"
                                onClick={() => {
                                    setSelectedPlan(plan.id);
                                    setShowPayment(false);
                                    setPaymentTransition(false);
                                }}
                                className={`relative rounded-2xl bg-white p-6 text-left transition-all duration-200 ${isSelected
                                    ? "shadow-lg"
                                    : "shadow-md hover:shadow-md"
                                    }`}
                            >

                                {plan.popular && (
                                    <span className="absolute right-5 top-5 rounded-full bg-brand-gold px-3 py-1 text-xs font-bold text-brand-navy">
                                        BEST VALUE
                                    </span>
                                )}


                                <div
                                    className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${isSelected ? "bg-brand-gold/20" : "bg-slate-100"
                                        }`}
                                >
                                    <Rocket
                                        className={`h-6 w-6 ${isSelected ? "text-brand-navy" : "text-slate-500"
                                            }`}
                                    />
                                </div>

                                <h2 className="text-xl font-bold text-brand-navy">
                                    {plan.name}
                                </h2>

                                <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                                    {plan.description}
                                </p>


                                <div className="mt-6 flex items-end gap-2">
                                    <span className="text-3xl font-bold text-brand-navy">
                                        ${plan.price}
                                    </span>

                                    <span className="mb-1 text-sm text-slate-500">
                                        / {plan.duration}
                                    </span>
                                </div>

                                <div className="my-6 border-t border-slate-200" />


                                <div className="space-y-3">
                                    {plan.features.map((feature) => (
                                        <div
                                            key={feature}
                                            className="flex items-center gap-3 text-sm text-slate-700"
                                        >
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
                                    className={`mt-7 flex h-11 w-full items-center justify-center rounded-xl text-sm font-bold ${isSelected
                                        ? "bg-brand-gold text-brand-navy"
                                        : "bg-slate-100 text-slate-600"
                                        }`}
                                >
                                    {isSelected ? "Selected Plan" : "Select Plan"}
                                </div>
                            </button>
                        );
                    })}
                </div>


                {!showPayment && (
                    <div className="mx-auto mt-8 max-w-3xl rounded-2xl bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Selected plan
                                </p>

                                <p className="font-bold text-brand-navy">
                                    {selected?.name} — ${selected?.price}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowPayment(true);

                                    setTimeout(() => {
                                        setPaymentTransition(true);
                                    }, 50);
                                }}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-navy px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
                            >
                                <Wallet className="h-4 w-4" />
                                Continue to Payment
                            </button>
                        </div>
                    </div>
                )}


                {showPayment && selected && (
                    <div
                        className={`mx-auto mt-8 max-w-2xl transition-all duration-500 ease-out ${paymentTransition
                            ? "translate-y-0 opacity-100"
                            : "translate-y-4 opacity-0"
                            }`}
                    >
                        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">


                            <div className="bg-brand-navy px-6 py-7 text-white sm:px-8">
                                <div className="flex items-center gap-4">

                                    <div>
                                        <h2 className="text-xl font-bold">
                                            Complete Your Payment
                                        </h2>

                                        <p className="mt-1 text-sm text-white/70">
                                            Pay securely with Whish Money to activate your boost.
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

                                            <p className="mt-1 text-base font-bold text-brand-navy">
                                                {selected.name}
                                            </p>

                                            <p className="mt-1 text-sm text-slate-500">
                                                {selected.duration} of boosted visibility
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-brand-navy">
                                                ${selected.price}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                Total
                                            </p>
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
                                            <h3 className="text-lg font-bold text-brand-navy">
                                                Whish Money
                                            </h3>

                                            <p className="mt-0.5 text-sm text-slate-500">
                                                Send the exact amount to complete your payment.
                                            </p>
                                        </div>
                                    </div>


                                    <div className="mt-6 rounded-2xl bg-white p-5 text-center shadow-sm">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Amount to Send
                                        </p>

                                        <p className="mt-1 text-2xl font-bold text-brand-navy">
                                            ${selected.price}
                                        </p>
                                    </div>


                                    <div className="mt-5">
                                        <p className="mb-2 text-sm font-semibold text-brand-navy">
                                            Whish Money Number
                                        </p>

                                        <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3.5 shadow-sm">
                                            <span className="text-base font-bold tracking-wide text-brand-navy">
                                                {whishNumber}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={copyWhishNumber}
                                                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-brand-navy transition hover:shadow-sm"
                                            >
                                                <Copy className="h-4 w-4" />
                                                {copied ? "Copied" : "Copy"}
                                            </button>
                                        </div>
                                    </div>


                                    <button
                                        type="button"
                                        onClick={() => {
                                            window.open("https://www.whish.money/whish-app", "_blank");
                                        }}
                                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 shadow-md"
                                    >
                                        <Wallet className="h-4 w-4" />
                                        Open Whish
                                    </button>
                                </div>

                                <div>
                                    <h3 className="text-base font-bold text-brand-navy">
                                        How it works
                                    </h3>

                                    <div className="mt-4 space-y-4">
                                        {[
                                            "Open Whish Money.",
                                            `Send $${selected.price} to the Maskanny Whish number.`,
                                            "Keep your payment confirmation.",
                                            "Return to Maskanny and submit your payment confirmation.",
                                        ].map((step, index) => (
                                            <div
                                                key={step}
                                                className="flex items-start gap-3"
                                            >
                                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-gold text-xs font-bold text-brand-navy">
                                                    {index + 1}
                                                </span>

                                                <p className="pt-1 text-sm leading-5 text-slate-600">
                                                    {step}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>


                                <div className="rounded-2xl bg-slate-50 p-6 shadow-sm">
                                    <div>
                                        <h3 className="text-base font-bold text-brand-navy">
                                            Payment Confirmation
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                            After sending the payment, upload your confirmation so we can verify
                                            your transaction.
                                        </p>
                                    </div>


                                    <div className="mt-5">
                                        <label className="mb-2 block text-sm font-semibold text-brand-navy">
                                            Payment Screenshot
                                        </label>

                                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl bg-white p-6 text-center shadow-sm transition hover:shadow-md">
                                            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
                                                <Copy className="h-5 w-5 text-brand-navy" />
                                            </div>

                                            <span className="text-sm font-semibold text-brand-navy">
                                                Upload payment confirmation
                                            </span>

                                            <span className="mt-1 text-xs text-slate-500">
                                                PNG, JPG or PDF
                                            </span>

                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,application/pdf"
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
                                            <span className="ml-1 font-normal text-slate-400">
                                                (optional)
                                            </span>
                                        </label>

                                        <input
                                            id="transactionReference"
                                            type="text"
                                            placeholder="Enter your Whish transaction reference"
                                            className="w-full rounded-xl bg-white px-4 py-3 text-sm text-brand-navy shadow-sm outline-none transition focus:shadow-md"
                                        />
                                    </div>


                                    <button
                                        type="button"
                                        onClick={() => {
                                            alert(
                                                `Payment submitted successfully!\n\nPlan: ${selected.name}\nAmount: $${selected.price}\n\nYour payment is now pending verification.`
                                            );

                                            router.push("/owner");
                                        }}
                                        className="w-full rounded-xl bg-brand-navy px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 shadow-md"
                                    >
                                        Submit Payment for Verification
                                    </button>
                                </div>


                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPayment(false);
                                        setPaymentTransition(false);
                                    }}
                                    className="w-full rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-navy shadow-sm transition hover:shadow-md"
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
            </div>
        </div>
    );
}
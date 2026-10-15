import Link from "next/link";
import type { Metadata } from "next";
import { Check } from "lucide-react";

export const metadata: Metadata = { title: "Property submitted | Maskanny" };

export default function PropertyConfirmationPage() {
  return (
    <main className="create-listing-page flex min-h-screen items-center justify-center px-5">
      <section
        aria-labelledby="confirmation-title"
        className="w-full max-w-[640px] rounded-(--radius-xl) border border-(--line) bg-(--surface) px-[44px] py-[48px] text-center max-[480px]:px-[24px] max-[480px]:py-[32px]"
      >
        <span className="create-listing-eyebrow">MASKANNY HOSTING</span>
        <div
          aria-hidden="true"
          className="mx-auto mb-6 grid size-16 place-items-center rounded-(--radius-full) bg-(--success) text-white ring-8 ring-(--success-bg)"
        >
          <Check size={28} strokeWidth={2.25} />
        </div>
        <h1
          id="confirmation-title"
          className="mx-auto max-w-[460px] text-[34px] font-medium leading-[1.15] tracking-[-0.025em] max-[480px]:text-[28px]"
        >
          Property submitted successfully!
        </h1>
        <p className="mt-5 text-[15px] leading-7 text-(--soft)">
          Your property has been submitted for review. Our team typically
          reviews listings within 12–24 hours.
        </p>
        <p className="mt-6 rounded-(--radius-sm) border border-(--success)/20 bg-(--success-bg) px-4 py-3 text-[13px] leading-6 text-(--success)">
          Your listing is published only after Admin approval and an active,
          paid boost.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-[52px] items-center justify-center rounded-(--radius-full) bg-(--ink) px-7 py-3 text-sm font-medium text-white! hover:bg-(--btn-bg-hover) focus-visible:outline-2 focus-visible:outline-(--ink) focus-visible:outline-offset-[4px] max-[480px]:w-full"
        >
          Go to Home Page
        </Link>
      </section>
    </main>
  );
}

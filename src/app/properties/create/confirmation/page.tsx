import Link from "next/link";
import type { Metadata } from "next";
import { Check, Clock3, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Property submitted | Maskanny",
};

export default function PropertyConfirmationPage() {
  return (
    <main className="flex min-h-[calc(100dvh-72px)] items-center justify-center bg-[var(--bg)] px-5 py-0">
      <section
        aria-labelledby="confirmation-title"
        className="relative w-full max-w-[560px] overflow-hidden rounded-2xl border border-[#385F71]/15 bg-white px-6 py-6 text-center shadow-[0_20px_60px_-35px_rgba(43,65,98,0.22)] sm:px-10 sm:py-7"
      >
        {/* Brand accent */}
        <div aria-hidden="true" className="absolute top-0 left-0 h-1 w-full bg-[#D7B377]" />

        <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8F754F]">
          Maskanny · Hosting
        </p>

        {/* Success icon */}
        <div
          aria-hidden="true"
          className="mx-auto mb-5 grid size-[60px] place-items-center rounded-full border border-[#D7B377]/50 bg-[#E9EEF2] text-[#2B4162]"
        >
          <Check size={30} strokeWidth={2.4} />
        </div>

        <h1
          id="confirmation-title"
          className="mx-auto max-w-[440px] text-[28px] leading-[1.2] font-semibold tracking-[-0.035em] text-[#2B4162] sm:text-[34px]"
        >
          Your property is submitted!
        </h1>

        <p className="mx-auto mt-4 max-w-[440px] text-[14px] leading-7 text-[#6F7F8D] sm:text-[15px]">
          Thank you for choosing Maskanny. Your listing has been received and is now waiting for our
          team to review it.
        </p>

        {/* Review information */}
        <div className="mt-6 flex items-start gap-4 rounded-xl border border-[#385F71]/10 bg-[#F8F9FB] p-4 text-left">
          <div className="grid size-10 shrink-0 place-items-center rounded-full border border-[#D7B377]/35 bg-white text-[#385F71]">
            <Clock3 size={19} />
          </div>

          <div>
            <h2 className="text-[14px] font-semibold text-[#2B4162]">What happens next?</h2>
            <p className="mt-1 text-[13px] leading-6 text-[#6F7F8D]">
              Our team typically reviews listings within 12–24 hours. You can check back after your
              listing has been reviewed.
            </p>
          </div>
        </div>

        {/* Publication requirements */}
        <div className="mt-3 flex items-start gap-3 rounded-xl border border-[#D7B377]/35 bg-[#FBF8F1] p-3 text-left">
          <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#8F754F]" aria-hidden="true" />

          <p className="text-[12px] leading-6 text-[#6F7F8D]">
            <span className="font-semibold text-[#2B4162]">Before publication:</span> Your listing
            must receive Admin approval and have an active, paid boosting plan.
          </p>
        </div>

        <Link
          href="/"
          className="mt-6 inline-flex min-h-[50px] w-full items-center justify-center rounded-full border border-[#D7B377]/50 bg-[#2B4162] px-7 py-3 text-[14px] font-semibold !text-white transition-colors duration-200 hover:border-[#D7B377] hover:bg-[#385F71] focus-visible:outline-2 focus-visible:outline-[#D7B377] focus-visible:outline-offset-4 sm:w-auto sm:min-w-[200px]"
        >
          Go to Home Page
          <span aria-hidden="true" className="ml-2 text-[#D7B377]">
            →
          </span>
        </Link>

        <p className="mt-5 text-[12px] text-[#8A98A6]">Student housing, made simpler.</p>
      </section>
    </main>
  );
}

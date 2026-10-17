import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

const focusClass =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#385F71]";

export default function NotFound() {
  return (
    <main className="student-marketplace grid min-h-[calc(100dvh-69px)] place-items-center bg-[#F5F0F6] px-5 py-12 text-[#2B4162] sm:px-6 sm:py-16">
      <div className="w-full max-w-[520px] text-center">
        <p
          aria-hidden="true"
          className="m-0 text-[clamp(88px,17vw,136px)] font-semibold leading-none tracking-[-0.07em] text-[#385F71]"
        >
          404
        </p>

        <h1 className="mt-6 mb-0 text-[clamp(26px,4vw,36px)] font-semibold leading-tight tracking-[-0.03em]">
          Page not found.
        </h1>

        <p className="mx-auto mt-4 mb-0 max-w-[370px] text-[13px] leading-7 text-[#6F7F8D] sm:text-sm">
          The page you&apos;re looking for may have moved or no longer exists. Let&apos;s find your
          way home.
        </p>

        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link
            href="/"
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#2B4162] px-6 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-[#385F71] ${focusClass}`}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to home
          </Link>

          <Link
            href="/properties"
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#385F71]/20 bg-white px-6 py-3 text-[13px] font-semibold text-[#2B4162] transition-colors hover:bg-[#E9EEF2] ${focusClass}`}
          >
            Browse properties
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  );
}

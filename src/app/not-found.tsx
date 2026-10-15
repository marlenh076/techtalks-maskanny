import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

const focusClass =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3D7659]";

export default function NotFound() {
  return (
    <main className="student-marketplace grid min-h-[calc(100dvh-69px)] place-items-center bg-[var(--bg)] px-5 py-12 text-[var(--ink)] sm:px-6 sm:py-16">
      <div className="w-full max-w-[520px] text-center">
        <p
          aria-hidden="true"
          className="m-0 text-[clamp(100px,20vw,160px)] font-medium leading-none tracking-[-0.08em] text-[#3D7659]"
        >
          404
        </p>
        <h1 className="mt-6 mb-0 text-[clamp(28px,5vw,40px)] font-medium leading-tight tracking-[-0.035em]">
          Page not found.
        </h1>
        <p className="mx-auto mt-4 mb-0 max-w-[370px] text-sm leading-7 text-[var(--soft)] sm:text-base">
          The page you&apos;re looking for may have moved or no longer exists.
          Let&apos;s find your way home.
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link
            href="/"
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#3D7659] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2D5C44] ${focusClass}`}
          >
            <ArrowLeft size={17} aria-hidden="true" />
            Back to home
          </Link>
          <Link
            href="/properties"
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--line-strong)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold text-[var(--ink-2)] hover:bg-[var(--chip)] ${focusClass}`}
          >
            Browse properties
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  );
}

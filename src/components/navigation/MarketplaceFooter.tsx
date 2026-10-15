"use client";

import Image from "next/image";
import Link from "next/link";
import { getBecomeHostHref } from "./marketplace-links";
import { useMarketplaceAccount } from "./useMarketplaceAccount";

const focusClass =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";
const linkClass = `inline-flex min-h-11 items-center rounded-sm text-sm text-[#D1DDD5] underline-offset-4 hover:text-white hover:underline ${focusClass}`;

export function MarketplaceFooter() {
  const { account } = useMarketplaceAccount();
  const hostHref = getBecomeHostHref(account);

  return (
    <footer
      aria-label="Maskanny footer"
      className="student-marketplace bg-[#233E32] text-white"
    >
      <div className="mx-auto w-[calc(100%-32px)] max-w-[1184px] pt-8 sm:w-[calc(100%-48px)] sm:pt-10 md:pt-12">
        <div className="grid gap-6 pb-7 md:grid-cols-[minmax(0,1fr)_180px_180px] md:gap-12 md:pb-10">
          <div className="min-w-0">
            <Link
              href="/"
              aria-label="Maskanny home"
              className={`inline-flex min-h-11 items-center gap-2.5 rounded-lg ${focusClass}`}
            >
              <Image
                src="/Maskanny.svg"
                alt=""
                width={36}
                height={36}
                className="shrink-0 rounded-[10px]"
              />
              <span className="text-xl font-semibold tracking-[-0.035em]">
                Maskanny
              </span>
            </Link>
            <p className="mt-3 mb-0 max-w-[300px] text-sm leading-6 text-[#D1DDD5]">
              Find student housing near your university, all in one place.
            </p>
          </div>
          <nav aria-label="Footer Explore">
            <h2 className="m-0 mb-1 text-sm font-semibold text-white">
              Explore
            </h2>
            <ul className="m-0 list-none p-0">
              <li>
                <Link href="/properties" className={linkClass}>
                  Browse properties
                </Link>
              </li>
              <li>
                <Link href="/#explore-universities" className={linkClass}>
                  Find by university
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Footer Hosting">
            <h2 className="m-0 mb-1 text-sm font-semibold text-white">
              Hosting
            </h2>
            <ul className="m-0 list-none p-0">
              <li>
                {hostHref ? (
                  <Link href={hostHref} className={linkClass}>
                    Become a host
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    aria-busy={account.status === "loading"}
                    title={
                      account.status === "error"
                        ? "Open the account menu to retry loading your account"
                        : "Checking your account…"
                    }
                    className={`${linkClass} text-left disabled:cursor-wait disabled:opacity-70`}
                  >
                    Become a host
                  </button>
                )}
              </li>
              <li>
                <Link href="/properties/create" className={linkClass}>
                  List your property
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="flex flex-col gap-2 border-t border-white/15 py-5 text-xs leading-5 text-[#D1DDD5] sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0">
            © {new Date().getFullYear()} Maskanny. All rights reserved.
          </p>
          <p className="m-0">Made for student living.</p>
        </div>
      </div>
    </footer>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { getBecomeHostHref } from "./marketplace-links";
import { useMarketplaceAccount } from "./useMarketplaceAccount";

const focusClass =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

const linkClass = `inline-flex min-h-7 sm:min-h-8 w-fit items-center rounded-lg text-xs sm:text-sm text-[#D4DDE8] transition-colors duration-200 hover:text-white ${focusClass}`;

export function MarketplaceFooter() {
  const { account } = useMarketplaceAccount();
  const hostHref = getBecomeHostHref(account);

  return (
    <footer
      aria-label="Maskanny footer"
      className="student-marketplace rounded-t-xl bg-[#1E3049] text-white sm:rounded-t-3xl"
    >
      <div className="mx-auto w-[calc(100%-28px)] max-w-[1184px] sm:w-[calc(100%-56px)]">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 py-4 sm:grid-cols-[minmax(0,1fr)_140px_150px_240px] sm:gap-6 sm:py-10">
          {/* Brand */}
          <div className="col-span-2 min-w-0 sm:col-span-1">
            <Link
              href="/"
              aria-label="Maskanny home"
              className={`inline-flex items-center gap-2 rounded-xl ${focusClass}`}
            >
              <Image
                src="/Maskanny.svg"
                alt=""
                width={34}
                height={34}
                className="h-7 w-7 shrink-0 rounded-lg object-contain sm:h-[38px] sm:w-[38px]"
              />

              <span className="text-base font-semibold tracking-tight sm:text-xl">Maskanny</span>
            </Link>

            <p className="mb-0 mt-1.5 max-w-[260px] text-xs leading-[18px] text-[#D4DDE8] sm:mt-3 sm:text-sm sm:leading-6">
              Find student housing near your university, all in one place.
            </p>
          </div>

          {/* Explore */}
          <nav aria-label="Footer Explore">
            <h2 className="mb-1.5 text-xs font-semibold text-white sm:mb-2.5 sm:text-sm">
              Explore
            </h2>

            <ul className="m-0 list-none space-y-0.5 p-0 sm:space-y-1.5">
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

          {/* Hosting */}
          <nav aria-label="Footer Hosting">
            <h2 className="mb-1.5 text-xs font-semibold text-white sm:mb-2.5 sm:text-sm">
              Hosting
            </h2>

            <ul className="m-0 list-none space-y-0.5 p-0 sm:space-y-1.5">
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
                    className={`${linkClass} text-left disabled:cursor-wait disabled:opacity-60`}
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

          {/* Contact */}
          <nav aria-label="Footer Contact" className="col-span-2 sm:col-span-1">
            <h2 className="mb-1.5 text-xs font-semibold text-white sm:mb-2.5 sm:text-sm">
              Contact
            </h2>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <a href="mailto:maskanny.org@gmail.com" className={linkClass}>
                Contact us
              </a>

              <a href="mailto:maskanny.org@gmail.com" className={`${linkClass} whitespace-nowrap`}>
                maskanny.org@gmail.com
              </a>
            </div>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-1.5 border-t border-white/10 py-2.5 text-[11px] leading-4 text-[#BFCBDA] sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:py-4 sm:text-xs sm:leading-5">
          <p className="m-0">© {new Date().getFullYear()} Maskanny. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link
              href="/privacy-policy"
              className="transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Privacy Policy
            </Link>

            <p className="m-0">Made for student living.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

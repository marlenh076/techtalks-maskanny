"use client";

import Image from "next/image";
import Link from "next/link";
import { getBecomeHostHref } from "./marketplace-links";
import { useMarketplaceAccount } from "./useMarketplaceAccount";

const focusClass =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

const linkClass = `inline-flex min-h-8 w-fit items-center rounded-lg text-sm text-[#D4DDE8] transition-colors duration-200 hover:text-white ${focusClass}`;

export function MarketplaceFooter() {
  const { account } = useMarketplaceAccount();
  const hostHref = getBecomeHostHref(account);

  return (
    <footer
      aria-label="Maskanny footer"
      className="student-marketplace rounded-t-3xl bg-[#1E3049] text-white"
    >
      <div className="mx-auto w-[calc(100%-36px)] max-w-[1184px] sm:w-[calc(100%-56px)]">
        <div className="grid grid-cols-2 gap-x-8 gap-y-7 py-9 sm:grid-cols-[minmax(0,1fr)_160px_180px] sm:gap-10 sm:py-10">
          {/* Brand */}
          <div className="col-span-2 min-w-0 sm:col-span-1">
            <Link
              href="/"
              aria-label="Maskanny home"
              className={`inline-flex items-center gap-2.5 rounded-xl ${focusClass}`}
            >
              <Image
                src="/Maskanny.svg"
                alt=""
                width={38}
                height={38}
                className="h-[38px] w-[38px] shrink-0 rounded-xl object-contain"
              />
              <span className="text-xl font-semibold tracking-tight">Maskanny</span>
            </Link>

            <p className="mb-0 mt-3 max-w-[290px] text-sm leading-6 text-[#D4DDE8]">
              Find student housing near your university, all in one place.
            </p>
          </div>

          {/* Explore */}
          <nav aria-label="Footer Explore">
            <h2 className="mb-2.5 text-sm font-semibold text-white">Explore</h2>
            <ul className="m-0 list-none space-y-1.5 p-0">
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
            <h2 className="mb-2.5 text-sm font-semibold text-white">Hosting</h2>
            <ul className="m-0 list-none space-y-1.5 p-0">
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
        </div>

        <div className="flex flex-col gap-2 rounded-t-xl py-4 text-xs leading-5 text-[#BFCBDA] sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0">© {new Date().getFullYear()} Maskanny. All rights reserved.</p>
          <p className="m-0">Made for student living.</p>
        </div>
      </div>
    </footer>
  );
}

"use client";

/**
 * Student profile (FR-S3), account settings (FR-S16) and saved dorms.
 *
 * ⚠️ ONLY ADD THIS FILE IF YOU DON'T ALREADY HAVE A PROFILE PAGE.
 * If you do, keep yours — the nav's "Profile" item points at "/profile" either
 * way, and you only need to match the visual treatment.
 *
 * ⚠️ NOT WIRED TO A BACKEND. The fields below are an empty UI shell: no fake
 * student data, no mock endpoint. Connect them to your real profile API when
 * it exists — the marked TODO is the only place that needs changing.
 */

import Link from "next/link";
import { useFavorites } from "@/hooks/useFavorites";

const fieldClass =
  "w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3.5 text-sm text-[#16171A] transition-colors duration-200 focus:border-[#16171A] focus:outline-none";

const labelClass = "mb-2 block text-[13px] text-[#5A5C54]";

export default function ProfilePage() {
  const { saved } = useFavorites();

  // TODO: replace with the real profile API (GET /api/students/me or similar).
  // Left empty on purpose so nothing fake ships to students.
  const profile = { name: "", email: "", phone: "", university: "", year: "" };

  return (
    <main className="min-h-screen bg-[#F4F2ED] pb-28 pt-[72px]">
      <div className="mx-auto w-full max-w-4xl px-5 pt-14 sm:px-8">
        <h1 className="text-[36px] font-medium leading-[1.05] tracking-[-0.03em] text-[#16171A] sm:text-[44px]">
          Your profile
        </h1>
        <p className="mt-4 text-base text-[#6F7168]">
          Keep your university details current so distances are accurate.
        </p>

        <section className="mt-12 rounded-[28px] bg-white p-7 ring-1 ring-black/[0.06] sm:p-9">
          <h2 className="text-[20px] font-medium tracking-[-0.02em] text-[#16171A]">
            Personal details
          </h2>

          <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="p-name">
                Full name
              </label>
              <input id="p-name" className={fieldClass} defaultValue={profile.name} />
            </div>
            <div>
              <label className={labelClass} htmlFor="p-email">
                Email
              </label>
              <input
                id="p-email"
                type="email"
                className={fieldClass}
                defaultValue={profile.email}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="p-phone">
                Phone
              </label>
              <input
                id="p-phone"
                type="tel"
                className={fieldClass}
                defaultValue={profile.phone}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="p-uni">
                University
              </label>
              <input id="p-uni" className={fieldClass} defaultValue={profile.university} />
            </div>
          </div>

          <button
            type="button"
            className="mt-8 rounded-full bg-[#16171A] px-7 py-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#33352F]"
          >
            Save changes
          </button>
        </section>

        <section className="mt-8 rounded-[28px] bg-white p-7 ring-1 ring-black/[0.06] sm:p-9">
          <h2 className="text-[20px] font-medium tracking-[-0.02em] text-[#16171A]">
            Saved dorms
          </h2>
          {saved.length === 0 ? (
            <p className="mt-4 text-sm leading-relaxed text-[#6F7168]">
              Nothing saved yet. Tap the heart on any dorm to keep it here.{" "}
              <Link
                href="/dorms"
                className="text-[#16171A] underline underline-offset-4"
              >
                Browse dorms
              </Link>
            </p>
          ) : (
            <p className="mt-4 text-sm text-[#6F7168]">
              {saved.length === 1 ? "1 dorm saved" : `${saved.length} dorms saved`}.{" "}
              <Link
                href="/dorms"
                className="text-[#16171A] underline underline-offset-4"
              >
                View them on Search
              </Link>
            </p>
          )}
        </section>

        <section className="mt-8 rounded-[28px] bg-white p-7 ring-1 ring-black/[0.06] sm:p-9">
          <h2 className="text-[20px] font-medium tracking-[-0.02em] text-[#16171A]">
            Account
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full border border-black/[0.1] px-6 py-3.5 text-sm font-medium text-[#16171A] transition-colors duration-200 hover:border-[#16171A]"
            >
              Change password
            </button>
            <button
              type="button"
              className="rounded-full border border-black/[0.1] px-6 py-3.5 text-sm font-medium text-[#8A3B32] transition-colors duration-200 hover:border-[#8A3B32]"
            >
              Deactivate account
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

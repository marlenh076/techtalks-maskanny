"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useFavorites } from "../../../student_side/useFavorites";

const fieldClass =
  "w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3.5 text-sm text-[#16171A] transition-colors duration-200 focus:border-[#16171A] focus:outline-none";
const labelClass = "mb-2 block text-[13px] text-[#5A5C54]";

interface ProfileValues {
  name: string;
  email: string;
  phone: string;
  university: string;
}

/**
 * ⚠️ NOT CONNECTED TO A BACKEND YET, so it always rejects. That makes the toast
 * show an honest error instead of a fake "saved" message.
 *
 * When the real endpoint is confirmed, replace the body with something like:
 *
 *   const res = await fetch(`/api/users/${userId}`, {
 *     method: "PATCH",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify(values),
 *   });
 *   if (!res.ok) throw new Error("The server rejected the update.");
 *
 * (Check the route's expected body and how it identifies the logged-in student first.)
 * Once it resolves, the "Profile saved" toast appears automatically.
 */
async function saveProfile(values: ProfileValues): Promise<void> {
  void values;
  throw new Error("Saving your profile isn't available yet.");
}

export default function ProfilePage() {
  const { saved } = useFavorites();
  const [saving, setSaving] = useState(false);
  const profile = { name: "", email: "", phone: "", university: "" };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return; // blocks double submits, so no duplicate toasts

    const form = new FormData(event.currentTarget);
    const values: ProfileValues = {
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      university: String(form.get("university") ?? "").trim(),
    };

    setSaving(true);
    const request = saveProfile(values);

    // Loading toast now; "success" only appears if the request actually resolves.
    toast.promise(request, {
      loading: "Saving your profile…",
      success: "Profile saved",
      error: (err: unknown) =>
        err instanceof Error ? err.message : "Couldn't save your profile. Please try again.",
    });

    try {
      await request;
    } catch {
      // The toast above already reports the failure.
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F2ED] pb-28 pt-[72px]">
      <div className="mx-auto w-full max-w-4xl px-5 pt-14 sm:px-8">
        <h1 className="text-[36px] font-medium leading-[1.05] tracking-[-0.03em] text-[#16171A] sm:text-[44px]">Your profile</h1>
        <p className="mt-4 text-base text-[#6F7168]">Keep your university details current so distances are accurate.</p>

        <form onSubmit={handleSubmit} className="mt-12 rounded-[28px] bg-white p-7 ring-1 ring-black/[0.06] sm:p-9">
          <h2 className="text-[20px] font-medium tracking-[-0.02em] text-[#16171A]">Personal details</h2>
          <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div><label className={labelClass} htmlFor="p-name">Full name</label><input id="p-name" name="name" className={fieldClass} defaultValue={profile.name} /></div>
            <div><label className={labelClass} htmlFor="p-email">Email</label><input id="p-email" name="email" type="email" className={fieldClass} defaultValue={profile.email} /></div>
            <div><label className={labelClass} htmlFor="p-phone">Phone</label><input id="p-phone" name="phone" type="tel" className={fieldClass} defaultValue={profile.phone} /></div>
            <div><label className={labelClass} htmlFor="p-uni">University</label><input id="p-uni" name="university" className={fieldClass} defaultValue={profile.university} /></div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mt-8 rounded-full bg-[#16171A] px-7 py-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#33352F] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>

        <section className="mt-8 rounded-[28px] bg-white p-7 ring-1 ring-black/[0.06] sm:p-9">
          <h2 className="text-[20px] font-medium tracking-[-0.02em] text-[#16171A]">Saved dorms</h2>
          {saved.length === 0 ? (
            <p className="mt-4 text-sm leading-relaxed text-[#6F7168]">
              Nothing saved yet. Tap the heart on any dorm to keep it here.{" "}
              <Link href="/dorms" className="text-[#16171A] underline underline-offset-4">Browse dorms</Link>
            </p>
          ) : (
            <p className="mt-4 text-sm text-[#6F7168]">
              {saved.length === 1 ? "1 dorm saved" : `${saved.length} dorms saved`}.{" "}
              <Link href="/dorms" className="text-[#16171A] underline underline-offset-4">View them on Search</Link>
            </p>
          )}
        </section>

        <section className="mt-8 rounded-[28px] bg-white p-7 ring-1 ring-black/[0.06] sm:p-9">
          <h2 className="text-[20px] font-medium tracking-[-0.02em] text-[#16171A]">Account</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="rounded-full border border-black/[0.1] px-6 py-3.5 text-sm font-medium text-[#16171A] transition-colors duration-200 hover:border-[#16171A]">
              Change password
            </button>
            <button type="button" className="rounded-full border border-black/[0.1] px-6 py-3.5 text-sm font-medium text-[#8A3B32] transition-colors duration-200 hover:border-[#8A3B32]">
              Deactivate account
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
"use client";

import { useState } from "react";
import { Mail, Phone } from "lucide-react";
import type { HostContact } from "../../repository/host_contact.repository";

export function ContactHost({ propertyId }: { propertyId: string }) {
  const [contact, setContact] = useState<HostContact | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function reveal() {
    setStatus("loading");
    try {
      const response = await fetch(`/api/properties/${propertyId}/contact`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Contact unavailable");
      setContact((await response.json()) as HostContact);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      {contact ? (
        <div className="mt-6 grid gap-3 border-t border-[var(--line)] pt-[18px]">
          <p className="font-semibold">
            {[contact.firstname, contact.lastname].filter(Boolean).join(" ") ||
              "Property host"}
          </p>
          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              className="flex items-center gap-2 text-[13px] text-[var(--ink-2)] [overflow-wrap:anywhere] hover:underline"
            >
              <Phone size={17} />
              {contact.phone}
            </a>
          )}
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-2 text-[13px] text-[var(--ink-2)] [overflow-wrap:anywhere] hover:underline"
            >
              <Mail size={17} />
              {contact.email}
            </a>
          )}
          {!contact.phone && !contact.email && (
            <p className="mx-2 mt-3.5 text-center text-[11px] leading-[1.55] text-[var(--soft)]">
              No contact details are available yet.
            </p>
          )}
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={reveal}
            disabled={status === "loading"}
            className="mt-6 inline-flex min-h-[50px] w-full items-center justify-center gap-3 rounded-full border-0 bg-[var(--btn-bg)] px-[18px] py-3 text-sm font-medium text-[var(--btn-ink)] hover:bg-[var(--btn-bg-hover)] focus-visible:outline-2 focus-visible:outline-[var(--ink)] focus-visible:outline-offset-[3px] disabled:cursor-wait disabled:opacity-60"
          >
            {status === "loading" ? "Loading contact…" : "Contact host"}
            {status !== "loading" && <span aria-hidden="true">→</span>}
          </button>
          {status === "error" && (
            <p role="alert" className="mt-3 text-[13px] text-[var(--danger)]">
              Host contact is unavailable right now. Please try again.
            </p>
          )}
          <p className="mx-2 mt-3.5 text-center text-[11px] leading-[1.55] text-[var(--soft)]">
            Contact the host to ask questions or arrange a viewing.
          </p>
        </>
      )}
    </div>
  );
}
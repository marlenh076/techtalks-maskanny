"use client";

import React, { useId, useState } from "react";
import { useModalFocus } from "./AdminUI";
import { Mail, Phone, User, X, Copy, Check, MessageSquare, ExternalLink } from "lucide-react";

export interface OwnerContact {
  name: string;
  phone: string;
  email: string;
}

interface ContactOwnerButtonProps {
  owner: OwnerContact;
  listingId?: string;
}

export default function ContactOwnerButton({ owner, listingId }: ContactOwnerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<"phone" | "email" | null>(null);
  const [copyError, setCopyError] = useState("");
  const titleId = useId();
  const focus = useModalFocus(isOpen, () => setIsOpen(false));

  const handleCopy = async (text: string, field: "phone" | "email") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyError("");
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      setCopyError("Unable to copy. Please copy the contact manually.");
    }
  };

  const formatWhatsAppNumber = (phone: string) => {
    if (!phone) return "";
    return phone.replace(/\D/g, "");
  };

  const whatsAppNumber = formatWhatsAppNumber(owner?.phone || "");

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-navy bg-brand-light border border-brand-slate/15 hover:bg-brand-navy hover:text-white transition-all duration-150 active:scale-95 shadow-2xs cursor-pointer"
        title="View Owner Contact Details"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        <span>Contact</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/40 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(event) => {
            event.stopPropagation();
            setIsOpen(false);
          }}
        >
          <div
            {...focus}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="bg-white rounded-2xl border border-brand-slate/15 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-brand-slate/10 bg-brand-light/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-navy/10 flex items-center justify-center text-brand-navy ring-1 ring-brand-navy/15">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 id={titleId} className="text-sm font-bold text-brand-navy tracking-tight">
                    Host Contact Information
                  </h3>
                  {listingId && (
                    <p className="text-[11px] text-brand-slate font-mono">Ref: {listingId}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-brand-slate hover:text-brand-navy hover:bg-brand-slate/10 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-brand-slate uppercase tracking-wider">
                  Host Full Name
                </label>
                <div className="px-3.5 py-2.5 rounded-xl bg-brand-light/40 border border-brand-slate/10 text-xs font-bold text-brand-navy shadow-2xs">
                  {owner?.name || "Not provided"}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-brand-slate uppercase tracking-wider">
                  Telephone & Direct Messaging
                </label>
                <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-brand-light/40 border border-brand-slate/10 text-xs font-semibold text-brand-navy shadow-2xs">
                  <div className="flex items-center gap-2.5 text-brand-navy">
                    <Phone className="w-3.5 h-3.5 text-brand-slate shrink-0" />
                    <span className="tracking-wide font-mono">
                      {owner?.phone || "No phone number available"}
                    </span>
                  </div>

                  {owner?.phone && (
                    <div className="flex items-center gap-1.5 pt-1 border-t border-brand-slate/10 justify-end flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleCopy(owner.phone, "phone")}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-brand-slate bg-white border border-brand-slate/20 hover:text-brand-navy hover:border-brand-slate/40 transition-all cursor-pointer shadow-2xs"
                        title="Copy to clipboard"
                      >
                        {copiedField === "phone" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`https://wa.me/${whatsAppNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold !text-white bg-emerald-600 hover:bg-emerald-700 hover:!text-white transition-all duration-200 shadow-2xs cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      <a
                        href={`tel:${owner.phone}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold !text-white bg-brand-navy hover:bg-brand-slate hover:!text-white transition-all duration-200 shadow-2xs cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-brand-slate uppercase tracking-wider">
                  Email Address
                </label>
                <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-brand-light/40 border border-brand-slate/10 text-xs font-semibold text-brand-navy shadow-2xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-brand-slate shrink-0" />
                    <span className="truncate font-mono">
                      {owner?.email || "No email available"}
                    </span>
                  </div>

                  {owner?.email && (
                    <div className="flex items-center gap-1.5 pt-1 border-t border-brand-slate/10 justify-end">
                      <button
                        type="button"
                        onClick={() => handleCopy(owner.email, "email")}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-brand-slate bg-white border border-brand-slate/20 hover:text-brand-navy hover:border-brand-slate/40 transition-all cursor-pointer shadow-2xs"
                        title="Copy to clipboard"
                      >
                        {copiedField === "email" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`mailto:${owner.email}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold !text-white bg-brand-navy hover:bg-brand-slate hover:!text-white transition-all duration-200 shadow-2xs cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Email Client</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {copyError && (
              <p role="alert" className="px-6 text-xs text-rose-700">
                {copyError}
              </p>
            )}
            <div className="px-6 py-3.5 bg-brand-light/40 border-t border-brand-slate/10 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-brand-navy bg-white border border-brand-slate/20 hover:bg-brand-slate/5 transition-colors cursor-pointer shadow-2xs"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

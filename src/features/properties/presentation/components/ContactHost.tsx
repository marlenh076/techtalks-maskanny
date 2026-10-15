"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Copy, LoaderCircle, MessageCircle, Phone, RefreshCw, UserRound, X } from "lucide-react";
import { hostContactSchema, type HostContact } from "../../models/host_contact.model";
import { hostContactPhone } from "./host-contact-phone";
import styles from "./ContactHost.module.css";

type ContactResult = { id: string } & (
  | { status: "loading" | "error" | "unavailable" }
  | { status: "ready"; contact: HostContact }
);

export function ContactHost({ propertyId }: { propertyId: string }) {
  const [result, setResult] = useState<ContactResult | null>(null);
  const [open, setOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const request = useRef<AbortController | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => () => request.current?.abort(), [propertyId]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  const current = result?.id === propertyId ? result : null;
  const contact = current?.status === "ready" ? current.contact : null;
  const phone = hostContactPhone(contact?.phone);
  const name = contact ? [contact.firstname, contact.lastname].filter((part) => part?.trim()).join(" ") : "";

  async function loadContact() {
    if (request.current && !request.current.signal.aborted) return;
    const controller = new AbortController();
    request.current = controller;
    setResult({ id: propertyId, status: "loading" });
    try {
      const response = await fetch(`/api/properties/${encodeURIComponent(propertyId)}/contact`, { cache: "no-store", signal: controller.signal });
      if (response.status === 404) {
        if (!controller.signal.aborted) setResult({ id: propertyId, status: "unavailable" });
        return;
      }
      if (!response.ok) throw new Error("Contact request failed");
      const contact = hostContactSchema.parse(await response.json());
      if (!controller.signal.aborted) setResult({ id: propertyId, status: "ready", contact });
    } catch {
      if (!controller.signal.aborted) setResult({ id: propertyId, status: "error" });
    } finally {
      if (request.current === controller) request.current = null;
    }
  }

  function reveal() {
    if (!dialog.current || dialog.current.open) return;
    setCopyStatus("idle");
    dialog.current.showModal();
    setOpen(true);
    void loadContact();
  }

  async function copyPhone() {
    if (!phone) return;
    try {
      await navigator.clipboard.writeText(phone.display);
      setCopyStatus("copied");
    } catch { setCopyStatus("error"); }
  }

  return <>
    <button ref={trigger} type="button" className={styles.trigger} aria-haspopup="dialog" onClick={reveal}>
      <MessageCircle size={18} aria-hidden="true" />Contact host
    </button>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={titleId} aria-describedby={descriptionId} onKeyDown={(event) => {
      if (event.key !== "Tab") return;
      const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not(:disabled)')).filter((item) => item.getClientRects().length > 0);
      const first = items[0];
      const last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }} onClose={() => {
      request.current?.abort();
      request.current = null;
      setOpen(false);
      trigger.current?.focus();
    }} onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) event.currentTarget.close();
    }}>
      <div className={styles.header}>
        <div className={styles.icon}><MessageCircle size={22} aria-hidden="true" /></div>
        <button type="button" autoFocus className={styles.close} aria-label="Close host contact" onClick={() => dialog.current?.close()}><X size={20} aria-hidden="true" /></button>
      </div>
      <h2 id={titleId}>Contact the host</h2>
      <p id={descriptionId} className={styles.description}>Ask about this place or arrange a viewing.</p>
      {(!current || current.status === "loading") && <p role="status" className={styles.state}><LoaderCircle size={19} className={styles.spinner} aria-hidden="true" />Loading host contact…</p>}
      {current?.status === "error" && <div className={styles.stateBlock}>
        <p role="alert">We couldn&apos;t load the host&apos;s contact details. Please try again.</p>
        <button type="button" className={styles.secondary} onClick={() => void loadContact()}><RefreshCw size={16} aria-hidden="true" />Try again</button>
      </div>}
      {contact && name && <p className={styles.name}><UserRound size={18} aria-hidden="true" /><span>{name}</span></p>}
      {(current?.status === "unavailable" || (contact && !phone)) && <p role="status" className={styles.stateBlock}>Public contact details aren&apos;t available for this property yet. Please check back later.</p>}
      {phone && <div className={styles.contact}>
        <p className={styles.label}>Phone number</p>
        <a className={styles.number} href={phone.tel}>{phone.display}</a>
        <a className={styles.primary} href={phone.tel}><Phone size={17} aria-hidden="true" />Call host</a>
        {phone.whatsapp && <a className={styles.secondary} href={phone.whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} aria-hidden="true" />Message on WhatsApp</a>}
        <button type="button" className={styles.copy} onClick={() => void copyPhone()}><Copy size={16} aria-hidden="true" />Copy phone number</button>
        <p role="status" className={styles.feedback}>{copyStatus === "copied" ? "Phone number copied." : copyStatus === "error" ? "Couldn’t copy. You can select the phone number above to copy it." : ""}</p>
      </div>}
    </dialog>
  </>;
}

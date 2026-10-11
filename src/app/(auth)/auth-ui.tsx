"use client";

import Link from "next/link";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

const subscribeToHydration = () => () => {};

const fieldClass = "h-12 w-full rounded-[var(--radius-sm)] border border-[var(--line-strong)] bg-[var(--surface)] px-4 text-sm text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--faint)] hover:border-[var(--ink-2)] focus-visible:border-[var(--ink)] focus-visible:ring-2 focus-visible:ring-[var(--line-strong)]";

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string; id: string };

export function AuthField({ label, id, className = "", ...props }: FieldProps) {
  const [visible, setVisible] = useState(false);
  const password = props.type === "password";
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-[var(--ink)]">{label}</label>
      <div className="relative">
        <input id={id} className={`${fieldClass} ${password ? "pr-12" : ""} ${className}`} {...props} type={password && visible ? "text" : props.type} />
        {password && (
          <button type="button" onClick={() => setVisible((current) => !current)} aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} aria-pressed={visible} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-[var(--radius-sm)] text-[var(--soft)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[var(--ink)]">
            {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        )}
      </div>
    </div>
  );
}

export function AuthPhoneField({ value, onChange, error }: { value: string; onChange: (value: string) => void; error: string | null }) {
  return (
    <div>
      <label htmlFor="phone" className="mb-2 block text-sm font-medium text-[var(--ink)]">Phone number</label>
      <div className="flex h-12 w-full overflow-hidden rounded-[var(--radius-sm)] border border-[var(--line-strong)] bg-[var(--surface)] text-sm transition-colors hover:border-[var(--ink-2)] focus-within:border-[var(--ink)] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--ink)]">
        <span id="phone-prefix" className="flex shrink-0 items-center border-r border-[var(--line-strong)] bg-[var(--chip)] px-4 font-medium text-[var(--ink)]">+961</span>
        <input id="phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" required value={value} onChange={(event) => onChange(event.currentTarget.value)} placeholder="03 123456" aria-describedby={error ? "phone-prefix phone-help phone-error" : "phone-prefix phone-help"} aria-invalid={Boolean(error)} className="h-full min-w-0 flex-1 bg-transparent px-4 text-[var(--ink)] outline-none placeholder:text-[var(--faint)]" />
      </div>
      {error && <p id="phone-error" role="alert" className="mt-2 text-sm text-[var(--danger)]">{error}</p>}
    </div>
  );
}

export function AuthButton({ loading, disabled = false, children }: { loading: boolean; disabled?: boolean; children: React.ReactNode }) {
  const hydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  return (
    <button type="submit" disabled={loading || disabled || !hydrated} className="flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--btn-bg)] px-5 text-sm font-semibold text-[var(--btn-ink)] transition-colors enabled:hover:bg-[var(--btn-bg-hover)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-60">
      {loading && <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />}{children}
    </button>
  );
}

export function AuthActionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="flex min-h-12 w-full items-center justify-center rounded-[var(--radius-sm)] bg-[var(--btn-bg)] px-5 text-center text-sm font-semibold text-[var(--btn-ink)]! transition-colors hover:bg-[var(--btn-bg-hover)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--ink)]">{children}</Link>;
}

export function AuthNotice({ message, success = false }: { message: string | null; success?: boolean }) {
  if (!message) return null;
  return <p role={success ? "status" : "alert"} className={`rounded-[var(--radius-sm)] px-4 py-3 text-sm leading-6 ${success ? "bg-[var(--success-bg)] text-[var(--success)]" : "bg-[var(--danger-bg)] text-[var(--danger)]"}`}>{message}</p>;
}

export function AuthHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-7">
      <h1 className="text-[clamp(2rem,4vw,2.5rem)] font-semibold leading-[1.12] tracking-[-0.04em] text-[var(--ink)]">{title}</h1>
      <p className="mt-2 max-w-[38ch] text-sm leading-6 text-[var(--soft)]">{description}</p>
    </div>
  );
}

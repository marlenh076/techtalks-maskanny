"use client";
import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { X } from "lucide-react";

export const inputClass =
  "w-full px-3 py-2 rounded-lg bg-brand-light/40 border border-brand-slate/20 !text-sm font-medium text-brand-navy placeholder:text-brand-slate/60 transition-all duration-200 focus:outline-none focus:border-brand-navy/50 focus:ring-2 focus:ring-brand-navy/15";

export const buttonClass =
  "inline-flex items-center justify-center px-3 py-2 rounded-lg !text-[14px] font-semibold text-white bg-brand-navy hover:bg-brand-slate hover:shadow-md active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-navy disabled:hover:shadow-none";
export function QueryState({
  loading,
  error,
  retry,
}: {
  loading?: boolean;
  error?: string;
  retry?: () => void;
}) {
  if (loading)
    return (
      <p role="status" className="p-5 text-sm text-brand-slate">
        Loading…
      </p>
    );
  if (error)
    return (
      <div
        role="alert"
        className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-700"
      >
        {error}{" "}
        {retry && (
          <button type="button" onClick={retry} className="ml-2 font-bold underline">
            Try again
          </button>
        )}
      </div>
    );
  return null;
}
export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="p-8 text-center text-sm text-brand-slate">{children}</p>;
}
export function Pagination({
  page,
  total,
  pageSize,
  onPage,
  onPageSize,
}: {
  page: number;
  total: number;
  pageSize: number;
  onPage: (page: number) => void;
  onPageSize?: (size: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex flex-wrap justify-between items-center gap-3 p-4 border-t border-brand-slate/10 text-xs text-brand-slate">
      <span>
        {total.toLocaleString()} entries · Page {page} of {pages}
      </span>
      <div className="flex items-center gap-2">
        {onPageSize && (
          <select
            aria-label="Entries per page"
            value={pageSize}
            onChange={(event) => onPageSize(Number(event.target.value))}
            className="rounded-lg border border-brand-slate/15 p-2"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
        )}
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="rounded-lg bg-brand-light px-3 py-2 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          className="rounded-lg bg-brand-light px-3 py-2 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
export function useModalFocus(open: boolean, onClose: () => void, busy = false) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    return () => previous?.focus();
  }, [open]);
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      if (!busy) onClose();
    }
    if (event.key === "Tab") {
      event.stopPropagation();
      const nodes = ref.current?.querySelectorAll<HTMLElement>(
        "button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]",
      );
      if (!nodes?.length) {
        event.preventDefault();
        return;
      }
      const first = nodes[0],
        last = nodes[nodes.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === ref.current)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || document.activeElement === ref.current)
      ) {
        event.preventDefault();
        first.focus();
      }
    }
  }
  return { ref, onKeyDown };
}
export function AdminModal({
  title,
  onClose,
  children,
  busy = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  busy?: boolean;
}) {
  const id = useId();
  const focus = useModalFocus(true, onClose, busy);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/40 backdrop-blur-xs"
      onClick={(event) => {
        event.stopPropagation();
        if (!busy) onClose();
      }}
    >
      <div
        {...focus}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="bg-white rounded-2xl border border-brand-slate/15 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-slate/10 bg-brand-light/30">
          <h3 id={id} className="text-sm font-bold text-brand-navy">
            {title}
          </h3>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-lg hover:bg-brand-light disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">{children}</div>
      </div>
    </div>
  );
}

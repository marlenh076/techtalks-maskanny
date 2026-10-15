"use client";

import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import type { KeyboardEvent } from "react";
import {
  HousePlus,
  LayoutDashboard,
  LoaderCircle,
  LogIn,
  LogOut,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  UserRound,
} from "lucide-react";
import { useLogout } from "@/src/lib/supabase/use-logout";
import type { MarketplaceAccount } from "./useMarketplaceAccount";

const focusClass =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--marketplace-focus,var(--success))]";
const itemLayout = `flex min-h-11 w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-sm font-medium transition-colors motion-reduce:transition-none ${focusClass}`;
const itemClass = `${itemLayout} text-[var(--ink-2)] hover:bg-[var(--chip)] focus-visible:bg-[var(--chip)]`;
type AuthenticatedAccount = Extract<
  MarketplaceAccount,
  { status: "authenticated" }
>;

// Only existing, addressable destinations belong here. Saved properties and
// history have no pages; My listings is currently a dashboard-local tab.
const accountLinks = {
  student: [{ label: "My profile", href: "/profile", icon: UserRound }],
  host: [
    { label: "Host dashboard", href: "/owner", icon: LayoutDashboard },
    { label: "Add property", href: "/properties/create", icon: HousePlus },
    { label: "My profile", href: "/profile", icon: UserRound },
  ],
  admin: [{ label: "Admin dashboard", href: "/admin", icon: ShieldCheck }],
};

function AuthenticatedMenu({
  account,
  onSelect,
  onLogoutError,
}: {
  account: AuthenticatedAccount;
  onSelect: () => void;
  onLogoutError?: () => void;
}) {
  const { logout, loggingOut, logoutError } = useLogout();
  const logoutAttempted = useRef(false);
  useEffect(() => {
    if (logoutError && logoutAttempted.current) {
      logoutAttempted.current = false;
      onLogoutError?.();
    }
  }, [logoutError, onLogoutError]);
  return (
    <>
      <div role="presentation" className="px-3 pt-2 pb-4">
        <div className="flex items-start justify-between gap-2">
          <p className="m-0 min-w-0 flex-1 truncate text-sm font-semibold text-[var(--ink)]">
            {account.name || account.email || "Your account"}
          </p>
          {account.role !== "student" && (
            <span className="inline-flex shrink-0 rounded-full bg-[var(--success-bg)] px-2 py-1 text-[11px] leading-none font-semibold text-[var(--success)] capitalize">
              {account.role}
            </span>
          )}
        </div>
        {account.name && account.email && (
          <p className="mt-1 truncate text-xs text-[var(--soft)]">
            {account.email}
          </p>
        )}
      </div>
      <div role="group" aria-label="Account actions">
        {accountLinks[account.role].map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            role="menuitem"
            tabIndex={-1}
            href={href}
            onClick={onSelect}
            className={itemClass}
          >
            <Icon
              size={17}
              aria-hidden="true"
              className="shrink-0 text-[var(--success)]"
            />
            {label}
          </Link>
        ))}
      </div>
      <div
        role="separator"
        className="mx-3 my-2 border-t border-[var(--line)]"
      />
      {logoutError && (
        <p
          role="alert"
          className="px-3 pb-2 text-xs leading-relaxed text-[var(--danger)]"
        >
          {logoutError}
        </p>
      )}
      <button
        type="button"
        role="menuitem"
        tabIndex={-1}
        disabled={loggingOut}
        aria-busy={loggingOut}
        onClick={() => {
          logoutAttempted.current = true;
          onSelect();
          void logout();
        }}
        className={`${itemLayout} text-[#cf373d] hover:bg-[#fff1f1] focus-visible:bg-[#fff1f1] disabled:cursor-wait disabled:opacity-60`}
      >
        {loggingOut ? (
          <LoaderCircle
            size={17}
            aria-hidden="true"
            className="motion-safe:animate-spin"
          />
        ) : (
          <LogOut size={17} aria-hidden="true" />
        )}
        {loggingOut ? "Logging out…" : "Log out"}
      </button>
    </>
  );
}

export function AccountMenu({
  account,
  onSelect,
  onRetry,
  onLogoutError,
}: {
  account: MarketplaceAccount;
  onSelect: () => void;
  onRetry: () => void;
  onLogoutError?: () => void;
}) {
  if (account.status === "loading")
    return (
      <p
        role="status"
        className="flex items-center gap-3 px-3 py-5 text-sm text-[var(--soft)]"
      >
        <LoaderCircle
          size={18}
          aria-hidden="true"
          className="motion-safe:animate-spin"
        />
        Checking your account…
      </p>
    );
  if (account.status === "error")
    return (
      <>
        <p
          role="alert"
          className="px-3 py-2 text-sm leading-relaxed text-[var(--soft)]"
        >
          We couldn&apos;t load your account. Please try again.
        </p>
        <button
          type="button"
          role="menuitem"
          tabIndex={-1}
          onClick={onRetry}
          className={itemClass}
        >
          <RefreshCw size={17} aria-hidden="true" />
          Try again
        </button>
      </>
    );
  if (account.status === "authenticated")
    return (
      <AuthenticatedMenu
        key={account.userId}
        account={account}
        onSelect={onSelect}
        onLogoutError={onLogoutError}
      />
    );
  return (
    <>
      <div role="presentation" className="px-3 pt-2 pb-4">
        <p className="m-0 text-sm font-semibold text-[var(--ink)]">
          Welcome to Maskanny
        </p>
        <p className="mt-1 text-xs leading-relaxed text-[var(--soft)]">
          Find your next student home
        </p>
      </div>
      <div
        role="group"
        aria-label="Sign in or register"
        className="space-y-2 px-1 pb-1"
      >
        <Link
          role="menuitem"
          tabIndex={-1}
          href="/sign-in"
          onClick={onSelect}
          className={`flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-[var(--success)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#314b35] motion-reduce:transition-none ${focusClass}`}
        >
          <LogIn size={17} aria-hidden="true" />
          Log in
        </Link>
        <Link
          role="menuitem"
          tabIndex={-1}
          href="/sign-up"
          onClick={onSelect}
          className={`flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-[var(--line-strong)] px-4 py-2.5 text-sm font-semibold text-[var(--ink-2)] transition-colors hover:bg-[var(--chip)] motion-reduce:transition-none ${focusClass}`}
        >
          <UserPlus size={17} aria-hidden="true" />
          Create account
        </Link>
      </div>
    </>
  );
}

export function AccountDropdown({
  account,
  onRetry,
  open,
  onOpenChange,
  transparent = false,
}: {
  account: MarketplaceAccount;
  onRetry: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transparent?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const focusEdge = useRef<"first" | "last">("first");
  const triggerId = useId();
  const menuId = useId();
  const enabledItems = () =>
    Array.from(
      menu.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not(:disabled)',
      ) ?? [],
    );

  useEffect(() => {
    if (!open) return;
    const items = Array.from(
      menu.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not(:disabled)',
      ) ?? [],
    );
    (focusEdge.current === "last"
      ? (items.at(-1) ?? menu.current)
      : (items[0] ?? menu.current)
    )?.focus();
  }, [open, account.status]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target))
        onOpenChange(false);
    };
    const focusOutside = (event: FocusEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target))
        onOpenChange(false);
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", focusOutside);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", focusOutside);
    };
  }, [open, onOpenChange]);

  function handleMenuKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" || (event.key === "Tab" && event.shiftKey)) {
      event.preventDefault();
      event.stopPropagation();
      onOpenChange(false);
      trigger.current?.focus();
      return;
    }
    const items = enabledItems();
    if (!items.length) return;
    const index = items.findIndex((item) => item === document.activeElement);
    let next: HTMLElement | undefined;
    if (event.key === "ArrowDown") next = items[(index + 1) % items.length];
    if (event.key === "ArrowUp")
      next =
        items[
          (index < 0 ? items.length - 1 : index - 1 + items.length) %
            items.length
        ];
    if (event.key === "Home") next = items[0];
    if (event.key === "End") next = items.at(-1);
    if (
      event.key.length === 1 &&
      event.key !== " " &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      next = [...items.slice(index + 1), ...items.slice(0, index + 1)].find(
        (item) =>
          item.textContent
            ?.trim()
            .toLowerCase()
            .startsWith(event.key.toLowerCase()),
      );
    }
    if (next) {
      event.preventDefault();
      next.focus();
    }
    if (
      event.key === " " &&
      document.activeElement instanceof HTMLAnchorElement &&
      items.includes(document.activeElement)
    ) {
      event.preventDefault();
      document.activeElement.click();
    }
  }

  return (
    <div ref={root} className="relative">
      <button
        ref={trigger}
        id={triggerId}
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-busy={account.status === "loading"}
        onClick={() => {
          focusEdge.current = "first";
          onOpenChange(!open);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            focusEdge.current = event.key === "ArrowUp" ? "last" : "first";
            onOpenChange(true);
          }
        }}
        className={`grid size-11 place-items-center rounded-full border transition-colors motion-reduce:transition-none ${focusClass} ${open ? "border-[var(--success)] bg-[var(--success-bg)] text-[var(--success)]" : transparent ? "border-white/40 text-white hover:bg-white/15" : "border-[var(--line-strong)] text-[var(--ink-2)] hover:bg-[var(--chip)]"}`}
      >
        <UserRound size={20} aria-hidden="true" />
      </button>
      <div
        ref={menu}
        id={menuId}
        role="menu"
        hidden={!open}
        aria-labelledby={triggerId}
        aria-busy={account.status === "loading"}
        tabIndex={-1}
        onKeyDown={handleMenuKey}
        className="absolute top-[calc(100%+12px)] right-0 z-50 max-h-[calc(100dvh-84px)] w-[280px] max-w-[calc(100vw-32px)] overflow-y-auto rounded-2xl border border-[var(--line-strong)] bg-[var(--surface)] p-2 text-[var(--ink)] shadow-[0_12px_36px_-12px_rgba(22,23,26,0.24)] outline-none [--marketplace-focus:var(--success)] max-md:fixed max-md:top-[68px] max-md:right-4"
      >
        <AccountMenu
          account={account}
          onSelect={() => onOpenChange(false)}
          onRetry={onRetry}
          onLogoutError={() => onOpenChange(true)}
        />
      </div>
    </div>
  );
}

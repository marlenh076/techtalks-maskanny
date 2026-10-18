"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, Menu, X } from "lucide-react";
import { AccountDropdown } from "./AccountDropdown";
import { useMarketplaceAccount } from "./useMarketplaceAccount";
import type { MarketplaceAccount } from "./useMarketplaceAccount";
import { getBecomeHostHref } from "./marketplace-links";

const focusClass =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--marketplace-focus)]";
function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}
const hasScrolled = () => window.scrollY > 60;
const serverScrolled = () => false;

export function MarketplaceNav() {
  const pathname = usePathname();
  const dashboard =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/owner" ||
    pathname.startsWith("/owner/");
  if (dashboard) return null;
  return pathname === "/host/onboarding" ? <MinimalMarketplaceNav /> : <FullMarketplaceNav />;
}

function MarketplaceBrand() {
  return (
    <Link
      href="/"
      aria-label="Maskanny home"
      className={`inline-flex items-center gap-2.5 rounded-lg ${focusClass}`}
    >
      <Image
        src="/Maskanny.svg"
        alt=""
        width={36}
        height={36}
        className="shrink-0 rounded-[10px]"
      />
      <span className="text-xl font-semibold tracking-[-0.035em]">Maskanny</span>
    </Link>
  );
}

function MinimalMarketplaceNav({ dashboard = false }: { dashboard?: boolean }) {
  return (
    <header className="student-marketplace sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] [--marketplace-focus:var(--success)]">
      <nav
        aria-label="Marketplace navigation"
        className={`mx-auto flex h-[68px] w-full max-w-[1232px] items-center justify-between sm:gap-3 sm:px-6 ${dashboard ? "gap-2 px-4" : "gap-3 px-5"}`}
      >
        <MarketplaceBrand />
        <Link
          href="/"
          className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full text-xs font-medium text-[var(--ink-2)] hover:bg-[var(--chip)] sm:text-sm ${dashboard ? "px-1 sm:px-2" : "px-2"} ${focusClass}`}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {dashboard ? "Back to homepage" : "Back to home"}
        </Link>
      </nav>
    </header>
  );
}

function FullMarketplaceNav() {
  const pathname = usePathname();
  const { account, reload } = useMarketplaceAccount();
  return (
    <FullMarketplaceNavView key={pathname} pathname={pathname} account={account} reload={reload} />
  );
}

function FullMarketplaceNavView({
  pathname,
  account,
  reload,
}: {
  pathname: string;
  account: MarketplaceAccount;
  reload: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const scrolled = useSyncExternalStore(subscribeToScroll, hasScrolled, serverScrolled);
  const homepage = pathname === "/";
  const transparent = homepage && !scrolled && !menuOpen;
  const menuButton = useRef<HTMLButtonElement>(null);
  const hostHref = getBecomeHostHref(account);
  const links = [
    { label: "Explore", href: "/properties" },
    { label: "Become a host", href: hostHref },
  ];

  const linkClass = (href: string | null) =>
    `inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium transition-colors motion-reduce:transition-none ${focusClass} ${transparent ? "text-white hover:bg-white/15" : pathname === href ? "text-[var(--color-brand-navy)] underline decoration-2 underline-offset-8 hover:bg-[var(--chip)]" : "text-[var(--ink-2)] hover:bg-[var(--chip)]"}`;
  const navItem = ({ href, label }: { href: string | null; label: string }) => (
    <li key={label}>
      {href ? (
        <Link
          href={href}
          onClick={() => setMenuOpen(false)}
          aria-current={pathname === href ? "page" : undefined}
          className={linkClass(href)}
        >
          {label}
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
          className={`${linkClass(null)} disabled:cursor-wait`}
        >
          {label}
        </button>
      )}
    </li>
  );

  return (
    <header
      data-transparent={transparent}
      className={`student-marketplace top-0 z-40 border-b transition-[background-color,border-color,color] duration-300 motion-reduce:transition-none ${homepage ? "fixed inset-x-0" : "sticky"} ${transparent ? "border-transparent bg-transparent text-white [--marketplace-focus:#fff]" : "border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] [--marketplace-focus:var(--success)]"}`}
      onKeyDown={(event) => {
        if (event.key === "Escape" && menuOpen) {
          setMenuOpen(false);
          menuButton.current?.focus();
        }
      }}
    >
      <nav
        aria-label="Marketplace navigation"
        className="mx-auto flex h-[68px] w-full max-w-[1232px] items-center justify-between gap-4 px-5 sm:px-6"
      >
        <MarketplaceBrand />
        <div className="flex items-center gap-2 sm:gap-3">
          <ul className="hidden items-center gap-1 md:flex">{links.map(navItem)}</ul>
          <AccountDropdown
            account={account}
            onRetry={reload}
            open={accountOpen}
            transparent={transparent}
            onOpenChange={(open) => {
              setAccountOpen(open);
              if (open) setMenuOpen(false);
            }}
          />
          <button
            ref={menuButton}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="marketplace-menu"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => {
              setAccountOpen(false);
              setMenuOpen((open) => !open);
            }}
            className={`grid size-11 place-items-center rounded-full md:hidden ${transparent ? "text-white hover:bg-white/15" : "text-[var(--ink-2)] hover:bg-[var(--chip)]"} ${focusClass}`}
          >
            {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </nav>
      <nav
        id="marketplace-menu"
        aria-label="Mobile marketplace navigation"
        hidden={!menuOpen}
        className="border-t border-[var(--line)] bg-[var(--bg)] px-5 py-3 text-[var(--ink)] md:hidden"
      >
        <ul className="mx-auto flex max-w-[1184px] flex-col gap-1">{links.map(navItem)}</ul>
      </nav>
    </header>
  );
}

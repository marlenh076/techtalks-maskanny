"use client";

/**
 * Student navigation: Home · Search · Details · Profile
 *
 * Result states (loading / empty / error) are deliberately NOT here. They are
 * states of the Search page, not destinations, and are rendered inside
 * DormResults.tsx.
 *
 * The bar sits over the hero photo at the top of a page, so it starts
 * transparent with white text and turns solid once scrolled.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLastViewedDorm } from "@/hooks/useLastViewedDorm";

interface NavItem {
  label: string;
  href: string;
}

export default function StudentNav() {
  const pathname = usePathname() ?? "/";
  const { lastViewedId } = useLastViewedDorm();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation.
  useEffect(() => setMenuOpen(false), [pathname]);

  /**
   * "Details" needs a dorm to show. Rather than adding a dead link, it points
   * at the last dorm the student opened; before they've opened one it falls
   * back to Search, where they pick a dorm from a card.
   */
  const items: NavItem[] = [
    { label: "Home", href: "/" },
    { label: "Search", href: "/dorms" },
    { label: "Details", href: lastViewedId ? `/dorms/${lastViewedId}` : "/dorms" },
    { label: "Profile", href: "/profile" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/dorms/")) return /^\/dorms\/[^/]+$/.test(pathname);
    if (href === "/dorms") return pathname === "/dorms";
    return pathname.startsWith(href);
  };

  // Solid bar on inner pages too, since only Home and Search have a hero.
  const solid = scrolled || menuOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        solid
          ? "border-b border-black/[0.07] bg-[#F4F2ED]/95 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <nav
        aria-label="Student navigation"
        className="mx-auto flex h-[72px] w-full max-w-6xl items-center justify-between gap-6 px-5 sm:px-8"
      >
        <Link
          href="/"
          className={`text-[19px] font-semibold tracking-[-0.02em] transition-colors duration-300 ${
            solid ? "text-[#16171A]" : "text-white"
          }`}
        >
          Maskani
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-4 py-2 text-sm transition-colors duration-200 ${
                    solid
                      ? active
                        ? "bg-[#16171A] text-white"
                        : "text-[#5A5C54] hover:bg-black/[0.05] hover:text-[#16171A]"
                      : active
                        ? "bg-white/95 text-[#16171A]"
                        : "text-white/85 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="student-nav-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className={`grid h-10 w-10 place-items-center rounded-full transition-colors duration-200 md:hidden ${
            solid ? "text-[#16171A] hover:bg-black/[0.05]" : "text-white hover:bg-white/15"
          }`}
        >
          <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
            {menuOpen ? (
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M3 6h14M3 10h14M3 14h14"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        id="student-nav-menu"
        className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out md:hidden motion-reduce:transition-none ${
          menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <ul className="overflow-hidden px-5 pb-4 sm:px-8">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-2xl px-4 py-3.5 text-[15px] transition-colors duration-200 ${
                    active
                      ? "bg-[#16171A] text-white"
                      : "text-[#3F4139] hover:bg-black/[0.04]"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </header>
  );
}

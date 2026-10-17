"use client";

import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  Mail,
  FileBarChart,
  Star,
  LogOut,
  Rocket,
} from "lucide-react";

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userEmail?: string;
  onLogout?: () => void;
  loggingOut?: boolean;
}

export function DashboardSidebar({
  activeTab,
  setActiveTab,
  userEmail,
  onLogout,
  loggingOut = false,
}: DashboardSidebarProps) {
  const navItems = [
    { id: "Dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "Listings", label: "Listings", icon: Building2 },
    { id: "Users", label: "Users", icon: Users },
    { id: "Boosting", label: "Boosting", icon: Rocket },
    { id: "Reviews", label: "Reviews", icon: Star },
    { id: "Reports", label: "Reports", icon: FileBarChart },
    { id: "Settings", label: "Settings", icon: Settings },
  ];

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-brand-slate/15 flex flex-col justify-between shrink-0 self-start md:sticky md:top-0 md:h-screen md:overflow-y-auto">
      <div className="p-4 md:p-6 space-y-4 md:space-y-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="Go to homepage"
            className="relative z-10 flex w-fit cursor-pointer items-center gap-3"
          >
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-xl">
              <Image
                src="/Maskanny.svg"
                alt="Maskanny Logo"
                fill
                className="object-contain p-1"
                priority
              />
            </div>

            <span className="text-lg font-bold tracking-tight text-brand-navy">Maskanny</span>
          </Link>
        </div>

        <nav
          aria-label="Admin sections"
          className="grid grid-cols-2 sm:grid-cols-3 md:block gap-1.5 md:space-y-1.5"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-brand-navy text-white shadow-sm"
                    : "text-brand-slate hover:bg-brand-light hover:text-brand-navy"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-brand-gold" : "text-brand-slate"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-brand-slate/10 mx-4 mb-4 md:m-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3">
        <div className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-brand-light/60 border border-brand-slate/10">
          <Mail className="w-3.5 h-3.5 text-brand-slate shrink-0" />
          <span className="text-xs font-medium text-brand-navy truncate">{userEmail}</span>
        </div>

        <button
          type="button"
          onClick={handleLogoutClick}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{loggingOut ? "Logging out…" : "Log Out"}</span>
        </button>
      </div>
    </aside>
  );
}

export default DashboardSidebar;

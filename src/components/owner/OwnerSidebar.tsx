'use client';

import React from 'react';
import Image from 'next/image';
import { useLogout } from '@/src/lib/supabase/use-logout';
import {
  LayoutDashboard,
  Building2,
  Settings,
  Mail,
  Star,
  LogOut,
  HousePlus
} from 'lucide-react';

interface OnwerSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userEmail?: string;
  onLogout?: () => void;
}

export function OwnerSidebar({
  activeTab,
  setActiveTab,
  userEmail = 'owner@maskanny.com',
  onLogout
}: OnwerSidebarProps) {
  const { logout, loggingOut, logoutError } = useLogout();
  const navItems = [
    { id: 'Dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'My Listings', label: 'My Listings', icon: Building2 },
    { id: 'Add Listing', label: 'Add Listing', icon: HousePlus },
    { id: 'Review', label: 'Reviews', icon: Star },
    { id: 'Settings', label: 'Settings', icon: Settings },
  ];

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {

      void logout();

    }
  };

  return (
    <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-brand-slate/15 flex flex-col justify-between shrink-0 self-stretch">
      <div className="p-4 md:p-6 space-y-4 md:space-y-8">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 overflow-hidden p-1.5">
            <Image
              src="/Maskanny.svg"
              alt="Maskanny Logo"
              fill
              className="object-contain p-1"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-brand-navy text-lg tracking-tight">
              Maskanny
            </span>
          </div>
        </div>

        <nav aria-label="Owner sections" className="grid grid-cols-2 sm:grid-cols-3 md:block gap-1.5 md:space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${isActive
                    ? 'bg-brand-navy text-white shadow-sm'
                    : 'text-brand-slate hover:bg-brand-light hover:text-brand-navy'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-gold' : 'text-brand-slate'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-brand-slate/10 m-4 space-y-3">
        <div className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-brand-light/60 border border-brand-slate/10">
          <Mail className="w-3.5 h-3.5 text-brand-slate shrink-0" />
          <span className="text-xs font-medium text-brand-navy truncate">
            {userEmail}
          </span>
        </div>

        {!onLogout && logoutError && <p role="alert" className="text-xs leading-relaxed text-rose-700">{logoutError}</p>}
        <button
          type="button"
          onClick={handleLogoutClick}
          disabled={!onLogout && loggingOut}
          aria-busy={!onLogout && loggingOut}
          className="w-full flex min-h-11 items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:cursor-wait disabled:opacity-60"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{!onLogout && loggingOut ? 'Logging out…' : 'Log Out'}</span>
        </button>
      </div>
    </aside>
  );
}

export default OwnerSidebar;

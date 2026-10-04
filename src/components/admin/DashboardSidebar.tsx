'use client';

import React from 'react';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Settings, 
  Mail, 
  FileBarChart,
  Star,
  LogOut
} from 'lucide-react';

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userEmail?: string;
  onLogout?: () => void;
}

export function DashboardSidebar({ 
  activeTab, 
  setActiveTab,
  userEmail = 'admin@maskanny.com',
  onLogout
}: DashboardSidebarProps) {
  const navItems = [
    { id: 'Dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'Listings', label: 'Listings', icon: Building2 },
    { id: 'Users', label: 'Users', icon: Users },
    { id: 'Reviews', label: 'Reviews', icon: Star },
    { id: 'Reports', label: 'Reports', icon: FileBarChart },
    { id: 'Settings', label: 'Settings', icon: Settings },
  ];

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
     
      console.log('Logging out user...');
     
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-brand-slate/15 flex flex-col justify-between shrink-0 self-stretch">
      <div className="p-6 space-y-8">
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

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive
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

        <button
          type="button"
          onClick={handleLogoutClick}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}

export default DashboardSidebar;
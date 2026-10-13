'use client';

import { User, Bell, Sliders, Shield, Globe, HelpCircle, ArrowLeft } from 'lucide-react';

interface OwnerSettingsSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function SettingsSidebar({ activeTab, setActiveTab }: OwnerSettingsSidebarProps) {
  return (
    <aside className="w-60 bg-white border-r border-brand-slate/15 flex flex-col shrink-0 min-h-screen">
      {/* Back to Dashboard */}
      <div className="p-4 border-b border-brand-slate/10">
        <button
          onClick={() => setActiveTab('Overview')}
          className="inline-flex items-center gap-2 text-xs font-bold text-brand-slate hover:text-brand-navy transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </button>
        <h2 className="text-sm font-extrabold text-brand-navy mt-2">Account Settings</h2>
      </div>


      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        <button
          onClick={() => setActiveTab('Settings - Profile')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'Settings - Profile'
              ? 'bg-brand-navy text-white shadow-sm'
              : 'text-brand-slate hover:bg-brand-light hover:text-brand-navy'
            }`}
        >
          <User className="w-3.5 h-3.5 shrink-0" />
          Profile & Account
        </button>

        <button
          onClick={() => setActiveTab('Settings - Notifications')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'Settings - Notifications'
              ? 'bg-brand-navy text-white shadow-sm'
              : 'text-brand-slate hover:bg-brand-light hover:text-brand-navy'
            }`}
        >
          <Bell className="w-3.5 h-3.5 shrink-0" />
          Notifications
        </button>

        <button
          onClick={() => setActiveTab('Settings - Listing Preferences')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'Settings - Listing Preferences'
              ? 'bg-brand-navy text-white shadow-sm'
              : 'text-brand-slate hover:bg-brand-light hover:text-brand-navy'
            }`}
        >
          <Sliders className="w-3.5 h-3.5 shrink-0" />
          Listing Configuration
        </button>

        <button
          onClick={() => setActiveTab('Settings - Security')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'Settings - Security'
              ? 'bg-brand-navy text-white shadow-sm'
              : 'text-brand-slate hover:bg-brand-light hover:text-brand-navy'
            }`}
        >
          <Shield className="w-3.5 h-3.5 shrink-0" />
          Privacy & Security
        </button>

        <button
          onClick={() => setActiveTab('Settings - Appearance')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'Settings - Appearance'
              ? 'bg-brand-navy text-white shadow-sm'
              : 'text-brand-slate hover:bg-brand-light hover:text-brand-navy'
            }`}
        >
          <Globe className="w-3.5 h-3.5 shrink-0" />
          Language & Appearance
        </button>

        <button
          onClick={() => setActiveTab('Settings - Support')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'Settings - Support'
              ? 'bg-brand-navy text-white shadow-sm'
              : 'text-brand-slate hover:bg-brand-light hover:text-brand-navy'
            }`}
        >
          <HelpCircle className="w-3.5 h-3.5 shrink-0" />
          Help & Support
        </button>
      </nav>
    </aside>
  );
}

export default SettingsSidebar;
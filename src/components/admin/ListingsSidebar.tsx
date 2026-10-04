'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  Home, 
  Building, 
  GraduationCap 
} from 'lucide-react';

export interface ListingFilter {
  status: 'ALL' | 'PENDING REVIEW' | 'ACTIVE' | 'REJECTED';
  category: 'ALL' | 'SHARED' | 'STUDIO' | 'DORM';
}

interface ListingsSidebarProps {
  pendingCount?: number;
  totalCount?: number;
  onFilterChange?: (filters: ListingFilter) => void;
}

export function ListingsSidebar({
  pendingCount = 0,
  totalCount = 0,
  onFilterChange,
}: ListingsSidebarProps) {
  const [activeStatus, setActiveStatus] = useState<ListingFilter['status']>('PENDING REVIEW');
  const [activeCategory, setActiveCategory] = useState<ListingFilter['category']>('ALL');

  const handleStatusChange = (status: ListingFilter['status']) => {
    setActiveStatus(status);
    onFilterChange?.({ status, category: activeCategory });
  };

  const handleCategoryChange = (category: ListingFilter['category']) => {
    setActiveCategory(category);
    onFilterChange?.({ status: activeStatus, category });
  };

  return (
    <aside className="w-full lg:w-72 bg-white rounded-2xl border border-brand-slate/15 p-5 shadow-2xs space-y-6 shrink-0 sticky top-6 self-start">
      <div className="flex items-center gap-2 pb-4 border-b border-brand-slate/10">
        <Filter className="w-4 h-4 text-brand-navy" />
        <h3 className="font-bold text-brand-navy text-sm uppercase tracking-wider">
          Listing Filters
        </h3>
      </div>

      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-brand-slate uppercase tracking-wider block mb-2">
          Verification Status
        </span>

        <button
          type="button"
          onClick={() => handleStatusChange('PENDING REVIEW')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeStatus === 'PENDING REVIEW'
              ? 'bg-brand-navy text-white shadow-2xs'
              : 'text-brand-navy hover:bg-brand-light/80'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${activeStatus === 'PENDING REVIEW' ? 'text-brand-gold' : 'text-brand-slate'}`} />
            <span>Pending Review</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeStatus === 'PENDING REVIEW'
                ? 'bg-brand-gold text-brand-navy'
                : 'bg-brand-gold/20 text-brand-navy'
            }`}
          >
            {pendingCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleStatusChange('ALL')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeStatus === 'ALL'
              ? 'bg-brand-navy text-white shadow-2xs'
              : 'text-brand-navy hover:bg-brand-light/80'
          }`}
        >
          <div className="flex items-center gap-2">
            <Building2 className={`w-4 h-4 ${activeStatus === 'ALL' ? 'text-brand-gold' : 'text-brand-slate'}`} />
            <span>All Submissions</span>
          </div>
          <span className={`text-[11px] font-semibold ${activeStatus === 'ALL' ? 'text-white/80' : 'text-brand-slate'}`}>
            {totalCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleStatusChange('ACTIVE')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeStatus === 'ACTIVE'
              ? 'bg-brand-navy text-white shadow-2xs'
              : 'text-brand-navy hover:bg-brand-light/80'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`w-3.5 h-3.5 ${activeStatus === 'ACTIVE' ? 'text-brand-gold' : 'text-brand-slate'}`} />
            <span>Published / Active</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleStatusChange('REJECTED')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeStatus === 'REJECTED'
              ? 'bg-brand-navy text-white shadow-2xs'
              : 'text-brand-navy hover:bg-brand-light/80'
          }`}
        >
          <div className="flex items-center gap-2">
            <XCircle className={`w-3.5 h-3.5 ${activeStatus === 'REJECTED' ? 'text-brand-gold' : 'text-brand-slate'}`} />
            <span>Rejected</span>
          </div>
        </button>
      </div>

      <div className="space-y-1.5 pt-4 border-t border-brand-slate/10">
        <span className="text-xs font-semibold text-brand-slate uppercase tracking-wider block mb-2">
          Property Type
        </span>

        {[
          { id: 'ALL' as const, label: 'All Types', icon: Building2 },
          { id: 'DORM' as const, label: 'Dormitories', icon: GraduationCap },
          { id: 'STUDIO' as const, label: 'Studio Flats', icon: Building },
          { id: 'SHARED' as const, label: 'Shared Apartments', icon: Home },
        ].map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.id)}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                isSelected
                  ? 'bg-brand-light text-brand-navy font-bold border border-brand-slate/20'
                  : 'text-brand-slate hover:text-brand-navy hover:bg-brand-light/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-brand-slate" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export default ListingsSidebar;
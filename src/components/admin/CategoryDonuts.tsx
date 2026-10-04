'use client';

import React from 'react';

export function CategoryDonut() {
 
  const donutStyle = {
    background: 'conic-gradient(#2B4162 0% 55%, #D7B377 55% 85%, #8F5D38 85% 100%)',
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-brand-slate/15 shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-brand-navy text-base mb-1">Listings by Type</h3>
        <p className="text-xs text-brand-slate mb-6">Distribution across categories</p>

        
        <div className="h-48 flex items-center justify-center">
          <div 
            className="w-36 h-36 rounded-full p-3.5 flex items-center justify-center relative shadow-inner"
            style={donutStyle}
          >
          
            <div className="w-full h-full bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
              <span className="text-lg font-bold text-brand-navy leading-tight">1,284</span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-brand-slate">Total</span>
            </div>
          </div>
        </div>
      </div>

      
      <div className="mt-4 space-y-2.5 text-xs">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2 text-brand-slate">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-navy shrink-0" /> 
            Shared Apartments
          </span>
          <span className="font-bold text-brand-navy">55%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2 text-brand-slate">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-gold shrink-0" /> 
            Studio Flats
          </span>
          <span className="font-bold text-brand-navy">30%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2 text-brand-slate">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-bronze shrink-0" /> 
            Dormitories
          </span>
          <span className="font-bold text-brand-navy">15%</span>
        </div>
      </div>
    </div>
  );
}
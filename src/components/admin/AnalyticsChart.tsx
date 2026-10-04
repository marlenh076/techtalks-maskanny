'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { day: 'Sep 01', views: 240, inquiries: 120 },
  { day: 'Sep 05', views: 300, inquiries: 150 },
  { day: 'Sep 10', views: 450, inquiries: 210 },
  { day: 'Sep 15', views: 380, inquiries: 190 },
  { day: 'Sep 20', views: 520, inquiries: 280 },
  { day: 'Sep 25', views: 610, inquiries: 340 },
  { day: 'Sep 30', views: 750, inquiries: 410 },
];

export function AnalyticsChart() {
  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-brand-slate/15 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-brand-navy text-base">Listing Views & Inquiries</h3>
          <p className="text-xs text-brand-slate">Activity performance over the last 30 days</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-brand-navy" />
            <span className="text-brand-slate">Views</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-brand-gold" />
            <span className="text-brand-slate">Inquiries</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2B4162" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#2B4162" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorInquiries" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D7B377" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#D7B377" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F0F6" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#385F71' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#385F71' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                borderColor: 'rgba(56, 95, 113, 0.2)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                fontSize: '12px',
                color: '#2B4162',
              }}
            />
            <Area
              type="monotone"
              dataKey="views"
              stroke="#2B4162"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorViews)"
            />
            <Area
              type="monotone"
              dataKey="inquiries"
              stroke="#D7B377"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorInquiries)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
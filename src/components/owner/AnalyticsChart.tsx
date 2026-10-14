'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { day: 'Sep 01', studentViews: 45 },
  { day: 'Sep 05', studentViews: 60 },
  { day: 'Sep 10', studentViews: 35 },
  { day: 'Sep 15', studentViews: 85 },
  { day: 'Sep 20', studentViews: 110 },
  { day: 'Sep 25', studentViews: 95 },
  { day: 'Sep 30', studentViews: 125 },
];

export function AnalyticsChart() {
  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-brand-slate/15 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="font-bold text-brand-navy text-base">Student Views For Listings</h3>
          <p className="text-xs text-brand-slate">Track overall engagement and property views by students over the last 30 days</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium pt-1">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-navy shrink-0" />
          <span className="text-brand-navy font-semibold">Student Views</span>
        </div>
      </div>

      <div className="h-70 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorStudentViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2B4162" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#2B4162" stopOpacity={0} />
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
              formatter={(value: any) => [`${value} views`, 'Student Views']}
            />
            <Area
              type="monotone"
              dataKey="studentViews"
              stroke="#2B4162"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorStudentViews)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
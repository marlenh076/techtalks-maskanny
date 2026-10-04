'use client';

import { useState, useMemo } from 'react';
import { DashboardSidebar } from '@/src/components/admin/DashboardSidebar';
import { MetricCard } from '@/src/components/admin/MetricCard';
import { AnalyticsChart } from '@/src/components/admin/AnalyticsChart';
import { CategoryDonut } from '@/src/components/admin/CategoryDonuts';
import { RecentSubmissions, Submission } from '@/src/components/admin/RecentSubmissions';
import { ListingsSidebar, ListingFilter } from '@/src/components/admin/ListingsSidebar';
import ReportsSidebar from '@/src/components/admin/ReportsSidebar';
import ReviewsSidebar from '@/src/components/admin/ReviewsSidebar';
import UsersManagementView, { INITIAL_STUDENTS, INITIAL_OWNERS } from '@/src/components/admin/UsersSidebar';
import SettingsView from '@/src/components/admin/SettingsSidebar';
import { Mail, Clock, GraduationCap, Building2, BarChart3, MessageSquare } from 'lucide-react';

export interface DatedSubmission extends Submission {
  createdAt: string;
}

const MOCK_SUBMISSIONS: DatedSubmission[] = [
  {
    id: 'sub-001',
    property: 'Campus View Dorm #101',
    host: 'Sarah Mansour',
    price: 400,
    status: 'Pending Review',
    category: 'DORM',
    createdAt: '2026-09-18',
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'sub-002',
    property: 'University Heights Room 202',
    host: 'Lina Nour',
    price: 420,
    status: 'Pending Review',
    category: 'DORM',
    createdAt: '2026-09-17',
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'sub-003',
    property: 'Green Residence Dorm B',
    host: 'Youssef Ali',
    price: 390,
    status: 'Pending Review',
    category: 'DORM',
    createdAt: '2026-09-15',
    imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'sub-004',
    property: 'Sunrise Student Studio',
    host: 'Kareem Hassan',
    price: 350,
    status: 'Active',
    category: 'STUDIO',
    createdAt: '2026-09-01',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'sub-005',
    property: 'Al-Nour Shared Flat',
    host: 'Tariq Ziad',
    price: 280,
    status: 'Active',
    category: 'SHARED',
    createdAt: '2026-08-20',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'sub-006',
    property: 'Downtown Student Hub',
    host: 'Omar Farooq',
    price: 310,
    status: 'Rejected',
    category: 'STUDIO',
    createdAt: '2026-09-18',
    imageUrl: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'sub-007',
    property: 'Cedar Ridge Apartments #4B',
    host: 'Maya Khalil',
    price: 510,
    status: 'Pending Review',
    category: 'SHARED',
    createdAt: '2026-09-10',
    imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=150&auto=format&fit=crop&q=80',
  },
];

type DateFilterPreset = 'TODAY' | 'WEEK' | 'MONTH' | 'ALL';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [submissions, setSubmissions] = useState<DatedSubmission[]>(MOCK_SUBMISSIONS);
  const [listingFilters, setListingFilters] = useState<ListingFilter>({
    status: 'PENDING REVIEW',
    category: 'ALL',
  });

  const [datePreset, setDatePreset] = useState<DateFilterPreset>('ALL');

  const handleAccept = (id: string) => {
    setSubmissions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Active' } : item))
    );
  };

  const handleReject = (id: string) => {
    setSubmissions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Rejected' } : item))
    );
  };

  const dateFilteredSubmissions = useMemo(() => {
    if (datePreset === 'ALL') return submissions;

    const now = new Date('2026-09-18');
    return submissions.filter((item) => {
      const itemDate = new Date(item.createdAt);
      const diffInDays = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24));

      if (datePreset === 'TODAY') return diffInDays === 0;
      if (datePreset === 'WEEK') return diffInDays <= 7;
      if (datePreset === 'MONTH') return diffInDays <= 30;

      return true;
    });
  }, [submissions, datePreset]);

  const pendingCount = dateFilteredSubmissions.filter((s) => s.status === 'Pending Review').length;
  const totalCount = dateFilteredSubmissions.length;

  return (
    <div className="flex min-h-screen bg-brand-light text-brand-navy w-full overflow-x-hidden">
      <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex flex-col min-w-0">
        <div className="p-4 sm:p-8 space-y-6 max-w-[1600px] w-full mx-auto flex-1 flex flex-col">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-brand-slate/15 shadow-sm shrink-0">
            <div>
              <h2 className="text-xl font-bold text-brand-navy">
                {activeTab === 'Listings'
                  ? 'Listings Management'
                  : activeTab === 'Users'
                  ? 'Users & Access Control'
                  : activeTab === 'Reports'
                  ? 'Analytics & Reports'
                  : activeTab === 'Reviews'
                  ? 'Reviews & Moderation'
                  : activeTab === 'Settings'
                  ? 'System Settings'
                  : 'Welcome back, Admin!'}
              </h2>
              <p className="text-xs text-brand-slate">
                {activeTab === 'Listings'
                  ? 'Review and manage property listings.'
                  : activeTab === 'Users'
                  ? 'Manage candidate student registrations and property host accounts.'
                  : activeTab === 'Reports'
                  ? 'Monitor listings, users, and platform activity.'
                  : activeTab === 'Reviews'
                  ? 'Moderate student feedback, rate student housing, and maintain rating standards.'
                  : activeTab === 'Settings'
                  ? 'Configure notification channels, security policies, and application preferences.'
                  : 'Here is what is happening with Maskanny today.'}
              </p>
            </div>

            
            {activeTab !== 'Users' && activeTab !== 'Reports' && activeTab !== 'Reviews' && activeTab !== 'Settings' && (
              <div className="inline-flex p-1 bg-brand-light rounded-xl border border-brand-slate/10 text-xs font-semibold self-start sm:self-auto">
                {(
                  [
                    { id: 'ALL', label: 'All Time' },
                    { id: 'TODAY', label: 'Today' },
                    { id: 'WEEK', label: 'This Week' },
                    { id: 'MONTH', label: 'This Month' },
                  ] as const
                ).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setDatePreset(preset.id)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      datePreset === preset.id
                        ? 'bg-white text-brand-navy shadow-sm font-bold'
                        : 'text-brand-slate hover:text-brand-navy'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          
          {activeTab === 'Dashboard' ? (
           
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <MetricCard title="Total Properties" value={totalCount.toString()} change="+12%" isPositive={true} />
                <MetricCard title="Active Students" value="1,240" change="+8.4%" isPositive={true} />
                <MetricCard title="Property Owners" value="184" change="+14.2%" isPositive={true} />
                
                <MetricCard 
                  title="Pending Listings" 
                  value={pendingCount.toString()} 
                  subtitle={pendingCount > 0 ? "Action needed" : "All clear"} 
                  isPositive={pendingCount === 0} 
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <AnalyticsChart />
                <CategoryDonut />
              </div>

             
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                  Pending Listings Status Overview
                </h3>
                <RecentSubmissions
                  activeStatus="PENDING REVIEW"
                  activeCategory="ALL"
                  submissions={dateFilteredSubmissions}
                  isReadOnly={true}
                />
              </div>

           
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-brand-navy" />
                  <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                    Recent Student Registrations Status Overview
                  </h3>
                </div>
                <div className="bg-white rounded-2xl border border-brand-slate/15 shadow-xs overflow-hidden w-full">
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm text-brand-navy border-collapse">
                      <thead className="bg-brand-light/60 border-b border-brand-slate/10 text-[11px] font-bold text-brand-slate uppercase tracking-wider">
                        <tr>
                          <th className="py-3.5 px-4">Student</th>
                          <th className="py-3.5 px-3">Target Dorm</th>
                          <th className="py-3.5 px-3">Request Date</th>
                          <th className="py-3.5 px-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-slate/10">
                        {INITIAL_STUDENTS.slice(0, 3).map((item) => (
                          <tr key={item.id} className="hover:bg-brand-light/25 transition-colors">
                            <td className="py-3 px-4 font-semibold">{item.studentName}</td>
                            <td className="py-3 px-3 text-brand-slate">{item.dormName}</td>
                            <td className="py-3 px-3 text-brand-slate">{item.requestedDate}</td>
                            <td className="py-3 px-4 text-right">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                                item.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                item.status === 'Pending Review' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

             
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-brand-navy" />
                  <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                    Property Owners Submissions Status Overview
                  </h3>
                </div>
                <div className="bg-white rounded-2xl border border-brand-slate/15 shadow-xs overflow-hidden w-full">
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm text-brand-navy border-collapse">
                      <thead className="bg-brand-light/60 border-b border-brand-slate/10 text-[11px] font-bold text-brand-slate uppercase tracking-wider">
                        <tr>
                          <th className="py-3.5 px-4">Owner</th>
                          <th className="py-3.5 px-3">Property Listing</th>
                          <th className="py-3.5 px-3">Price</th>
                          <th className="py-3.5 px-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-slate/10">
                        {INITIAL_OWNERS.slice(0, 3).map((item) => (
                          <tr key={item.id} className="hover:bg-brand-light/25 transition-colors">
                            <td className="py-3 px-4 font-semibold">{item.ownerName}</td>
                            <td className="py-3 px-3 text-brand-slate">{item.propertyTitle}</td>
                            <td className="py-3 px-3 font-medium">${item.price}/mo</td>
                            <td className="py-3 px-4 text-right">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                                item.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                item.status === 'Pending Review' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          ) : activeTab === 'Listings' ? (
            
            <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full min-w-0 flex-1">
              <ListingsSidebar
                pendingCount={pendingCount}
                totalCount={totalCount}
                onFilterChange={(filters) => setListingFilters(filters)}
              />

              <RecentSubmissions
                activeStatus={listingFilters.status}
                activeCategory={listingFilters.category}
                submissions={dateFilteredSubmissions}
                onAccept={handleAccept}
                onReject={handleReject}
                isReadOnly={false}
              />
            </div>
          ) : activeTab === 'Users' ? (
           
            <UsersManagementView />
          ) : activeTab === 'Reports' ? (
           
            <ReportsSidebar />
          ) : activeTab === 'Reviews' ? (
            
            <ReviewsSidebar />
          ) : (
           
            <SettingsView />
          )}
        </div>
      </main>
    </div>
  );
}
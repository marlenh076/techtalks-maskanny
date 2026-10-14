'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Building2, 
  Users, 
  Star, 
  Activity, 
  Home, 
  ArrowUpRight, 
  Download,
  AlertTriangle,
  Search,
  Heart,
  MessageCircle,
  Eye,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart,
  Area,
  BarChart, 
  Bar, 
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

type ReportTab = 'OVERVIEW' | 'USERS' | 'LISTINGS' | 'REVIEWS' | 'ACTIVITY';

const USER_GROWTH_DATA = [
  { period: 'May', students: 780, owners: 140 },
  { period: 'Jun', students: 920, owners: 155 },
  { period: 'Jul', students: 1050, owners: 170 },
  { period: 'Aug', students: 1160, owners: 178 },
  { period: 'Sep', students: 1240, owners: 184 },
];

const LISTING_STATUS_DATA = [
  { status: 'Approved', count: 245 },
  { status: 'Pending', count: 52 },
  { status: 'Rejected', count: 13 },
];

const OCCUPANCY_STATUS_DATA = [
  { name: 'Available / Vacant', value: 157, color: '#0f172a' }, 
  { name: 'Almost Full / Shared', value: 88, color: '#3b82f6' },  
  { name: 'Fully Booked', value: 65, color: '#d97706' },        
];

const ACTIVITY_TRAJECTORY_DATA = [
  { month: 'May', searches: 9200, views: 21000 },
  { month: 'Jun', searches: 11400, views: 25400 },
  { month: 'Jul', searches: 12800, views: 28900 },
  { month: 'Aug', searches: 13900, views: 30800 },
  { month: 'Sep', searches: 14820, views: 32500 },
];

export default function ReportsSidebar() {
  const [activeReportTab, setActiveReportTab] = useState<ReportTab>('OVERVIEW');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDownloadReport = () => {
    const dataMap: Record<ReportTab, string> = {
      OVERVIEW: 'Metric,Value\nTotal Users,1424\nTotal Listings,310\nActive Listings,245\nPending/Rejected,65\nTotal Reviews,312\nReported Content,4',
      USERS: 'Category,Count\nNew Users Over Time,1424\nStudents,1240\nProperty Owners,184\nActive Users,1380\nSuspended Users,12',
      LISTINGS: 'Category,Count\nNew Listings (This Month),45\nApproved,245\nPending Review,52\nRejected,13\nFully Occupied,88',
      REVIEWS: 'Metric,Value\nTotal Reviews,312\nAverage Rating,4.8\nReported Reviews,4\nPositive Feedback,84%',
      ACTIVITY: 'Metric,Count\nTotal Searches,14820\nFavorites Saved,3410\nContact Requests,840\nListing Views,32500'
    };

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(dataMap[activeReportTab]);
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `platform_report_${activeReportTab.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 w-full flex-1">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-brand-slate/15 scrollbar-none">
        {[
          { id: 'OVERVIEW', label: 'Overview', icon: BarChart3 },
          { id: 'USERS', label: 'User Reports', icon: Users },
          { id: 'LISTINGS', label: 'Listing Reports', icon: Building2 },
          { id: 'REVIEWS', label: 'Reviews & Reports', icon: Star },
          { id: 'ACTIVITY', label: 'Platform Activity', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReportTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id as ReportTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'bg-white text-brand-slate hover:text-brand-navy border border-brand-slate/15'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeReportTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Total Users - Accent Blue Icon & Tag */}
            <div className="bg-white p-5 rounded-2xl border border-brand-slate/15 shadow-2xs flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-slate uppercase tracking-wider">Total Users</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-brand-navy">1,424</div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/50">
                  <ArrowUpRight className="w-3 h-3" /> +12.4%
                </div>
              </div>
            </div>

            {/* Total Listings - Subtle Bronze Accent */}
            <div className="bg-white p-5 rounded-2xl border border-brand-slate/15 shadow-2xs flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-slate uppercase tracking-wider">Total Listings</span>
                <Building2 className="w-4 h-4 text-amber-700" />
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-brand-navy">310</div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                  <ArrowUpRight className="w-3 h-3" /> +8 new
                </div>
              </div>
            </div>

            {/* Active Listings - Blue Accent */}
            <div className="bg-white p-5 rounded-2xl border border-brand-slate/15 shadow-2xs flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-slate uppercase tracking-wider">Active Listings</span>
                <Home className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-brand-navy">245</div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/50">
                  79% active ratio
                </div>
              </div>
            </div>

            {/* Pending / Rejected - Bronze Alert Tone */}
            <div className="bg-white p-5 rounded-2xl border border-brand-slate/15 shadow-2xs flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-slate uppercase tracking-wider">Pending / Rejected</span>
                <AlertTriangle className="w-4 h-4 text-amber-700" />
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-brand-navy">65</div>
                <span className="text-[11px] font-semibold text-brand-slate">52 pending, 13 rejected</span>
              </div>
            </div>

            {/* Total Reviews - Bronze Star Accent */}
            <div className="bg-white p-5 rounded-2xl border border-brand-slate/15 shadow-2xs flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-slate uppercase tracking-wider">Total Reviews</span>
                <Star className="w-4 h-4 text-amber-700 fill-amber-700/10" />
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-brand-navy">312</div>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">4.8 / 5.0 avg</span>
              </div>
            </div>

            {/* Reported Content */}
            <div className="bg-white p-5 rounded-2xl border border-brand-slate/15 shadow-2xs flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-slate uppercase tracking-wider">Reported Content</span>
                <AlertTriangle className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-brand-navy">4</div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/50">
                  Action pending
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'USERS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-brand-slate/15 shadow-2xs flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-slate uppercase tracking-wider">Students</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-brand-navy">1,240</div>
                <div className="text-xs text-brand-slate mt-0.5">Active university candidates</div>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-brand-slate/15 shadow-2xs flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-slate uppercase tracking-wider">Property Owners</span>
                <Building2 className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <div className="text-2xl font-bold text-brand-navy">184</div>
                <div className="text-xs text-brand-slate mt-0.5">Verified accommodation hosts</div>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-brand-slate/15 shadow-2xs flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-slate uppercase tracking-wider">Active / Inactive</span>
                <Activity className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-brand-navy">1,380 / 44</div>
                <div className="text-xs text-brand-slate mt-0.5">High platform engagement</div>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-brand-slate/15 shadow-2xs flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-slate uppercase tracking-wider">Suspended Users</span>
                <AlertTriangle className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <div className="text-2xl font-bold text-brand-navy">12</div>
                <div className="text-xs text-brand-slate mt-0.5">Policy violation blocks</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-brand-slate/15 shadow-2xs space-y-4 lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider">User Registrations Over Time</h3>
                  <p className="text-xs text-brand-slate">Cumulative student vs. property owner growth trajectory.</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-brand-navy">
                    <span className="w-2 h-2 rounded-full bg-brand-navy"></span> Students
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold text-brand-slate">
                    <span className="w-2 h-2 rounded-full bg-amber-700"></span> Property Owners
                  </span>
                </div>
              </div>

              <div className="h-72 w-full pt-4">
                {isMounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={USER_GROWTH_DATA} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                      <defs>
                        <linearGradient id="studentGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0f172a" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="ownerGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d97706" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis 
                        dataKey="period" 
                        stroke="#64748b" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={{ stroke: '#cbd5e1' }}
                      />
                      <YAxis 
                        stroke="#64748b" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          borderColor: '#cbd5e1', 
                          borderRadius: '12px', 
                          fontSize: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="students" 
                        name="Students" 
                        stroke="#0f172a" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#studentGradient)" 
                        dot={{ r: 4, fill: '#0f172a', strokeWidth: 2, stroke: '#ffffff' }}
                        activeDot={{ r: 6, strokeWidth: 2 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="owners" 
                        name="Property Owners" 
                        stroke="#d97706" 
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill="url(#ownerGradient)" 
                        dot={{ r: 3, fill: '#d97706', strokeWidth: 2, stroke: '#ffffff' }}
                        activeDot={{ r: 5, strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-brand-slate">Loading chart...</div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-brand-slate/15 shadow-2xs space-y-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider">User Activity Breakdown</h3>
                <p className="text-xs text-brand-slate">Real-time engagement distribution metrics.</p>
              </div>
              
              <div className="space-y-4 text-xs font-medium">
                <div className="p-3.5 rounded-xl bg-brand-light/50 border border-brand-slate/10 space-y-1.5">
                  <div className="flex justify-between font-bold text-brand-navy">
                    <span className="flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5 text-blue-500" /> Highly Active Students</span>
                    <span>1,120</span>
                  </div>
                  <div className="w-full bg-brand-light h-2 rounded-full overflow-hidden">
                    <div className="bg-brand-navy h-full rounded-full w-[90%]" />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-brand-light/50 border border-brand-slate/10 space-y-1.5">
                  <div className="flex justify-between font-bold text-brand-navy">
                    <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-amber-700" /> Verified Hosts</span>
                    <span>172</span>
                  </div>
                  <div className="w-full bg-brand-light h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-700 h-full rounded-full w-[93%]" />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-brand-light/50 border border-brand-slate/10 space-y-1.5">
                  <div className="flex justify-between font-bold text-brand-navy">
                    <span className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-brand-slate" /> Restricted Accounts</span>
                    <span>12</span>
                  </div>
                  <div className="w-full bg-brand-light h-2 rounded-full overflow-hidden">
                    <div className="bg-brand-slate h-full rounded-full w-[8%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'LISTINGS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-brand-slate/15 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider">Listing Status Distribution</h3>
            <p className="text-xs text-brand-slate">Overview of approved, pending, and rejected property applications.</p>
            
            <div className="h-64 w-full pt-4">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={LISTING_STATUS_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="status" stroke="#64748b" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '12px' }} />
                    <Bar dataKey="count" name="Listings Count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-brand-slate">Loading chart...</div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-brand-slate/15 shadow-2xs space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider">Occupancy Status Breakdown</h3>
              <p className="text-xs text-brand-slate">Real-time capacity tracking across active housing units.</p>
            </div>
            
            <div className="h-56 w-full relative">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        borderColor: '#cbd5e1', 
                        borderRadius: '12px', 
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }} 
                    />
                    <Pie
                      data={OCCUPANCY_STATUS_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {OCCUPANCY_STATUS_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-brand-slate">Loading chart...</div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-brand-slate/10 text-xs">
              {OCCUPANCY_STATUS_DATA.map((item) => (
                <div key={item.name} className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 font-semibold text-brand-navy">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="truncate">{item.name}</span>
                  </div>
                  <span className="font-bold text-brand-slate pl-4">{item.value} units</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'REVIEWS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-brand-slate/15 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider">Reviews & Ratings Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-brand-light/50 border border-brand-slate/10 space-y-1">
                <div className="text-xs text-brand-slate font-semibold">Total Reviews</div>
                <div className="text-2xl font-bold text-brand-navy">312</div>
              </div>
              <div className="p-4 rounded-xl bg-brand-light/50 border border-brand-slate/10 space-y-1">
                <div className="text-xs text-brand-slate font-semibold">Average Rating</div>
                <div className="text-2xl font-bold text-amber-700">4.8 / 5.0</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-brand-slate/15 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider">Moderation & Reported Content</h3>
            <div className="space-y-3 text-xs font-medium">
              <div className="flex items-center justify-between p-3 rounded-xl bg-brand-light/50">
                <span className="text-brand-slate">Reported Reviews</span>
                <span className="font-bold text-brand-navy">4 items</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-brand-light/50">
                <span className="text-brand-slate">Positive Sentiment Trend</span>
                <span className="font-bold text-blue-600">84% positive</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'ACTIVITY' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-brand-slate/15 shadow-2xs flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-slate uppercase tracking-wider">Total Searches</span>
                <Search className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-brand-navy">14,820</div>
                <div className="text-xs text-brand-slate mt-0.5">Queries executed this term</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-brand-slate/15 shadow-2xs flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-slate uppercase tracking-wider">Favorites Saved</span>
                <Heart className="w-4 h-4 text-amber-700 fill-amber-700/10" />
              </div>
              <div>
                <div className="text-2xl font-bold text-brand-navy">3,410</div>
                <div className="text-xs text-brand-slate mt-0.5">Wishlist items bookmarked</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-brand-slate/15 shadow-2xs flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-slate uppercase tracking-wider">Contact Requests</span>
                <MessageCircle className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-brand-navy">840</div>
                <div className="text-xs text-brand-slate mt-0.5">Direct inquiries sent</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-brand-slate/15 shadow-2xs flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-slate uppercase tracking-wider">Listing Views</span>
                <Eye className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <div className="text-2xl font-bold text-brand-navy">32,500</div>
                <div className="text-xs text-brand-slate mt-0.5">Cumulative page hits</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-brand-slate/15 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider">Search & Traffic Trajectory</h3>
                <p className="text-xs text-brand-slate">Monthly comparative analytics of student search queries versus listing page views.</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-brand-navy">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-navy"></span> Listing Views
                </span>
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-700"></span> Searches
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ACTIVITY_TRAJECTORY_DATA} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f172a" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="searchesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d97706" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      stroke="#64748b" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        borderColor: '#cbd5e1', 
                        borderRadius: '12px', 
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      name="Listing Views" 
                      stroke="#0f172a" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#viewsGradient)" 
                      dot={{ r: 4, fill: '#0f172a', strokeWidth: 2, stroke: '#ffffff' }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="searches" 
                      name="Searches" 
                      stroke="#d97706" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#searchesGradient)" 
                      dot={{ r: 3, fill: '#d97706', strokeWidth: 2, stroke: '#ffffff' }}
                      activeDot={{ r: 5, strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-brand-slate">Loading chart...</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-brand-slate/15 shadow-2xs mt-2">
        <div className="text-xs text-brand-slate font-medium">
          Export full analytics breakdown for <span className="font-bold text-brand-navy uppercase">{activeReportTab}</span> as a CSV file.
        </div>
        <button
          onClick={handleDownloadReport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-brand-navy text-white hover:bg-brand-navy/90 transition-colors shadow-sm cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV Report
        </button>
      </div>
    </div>
  );
}
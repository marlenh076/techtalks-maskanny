'use client';

import React, { useState, useMemo } from 'react';
import { 
  MessageSquare, 
  Star, 
  Search, 
  SlidersHorizontal, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Mail,
  Trash2,
  Building2
} from 'lucide-react';

export interface ReviewItem {
  id: string;
  reviewerName: string;
  reviewerEmail: string;
  reviewerAvatar?: string;
  propertyTitle: string;
  rating: number;
  comment: string;
  requestedDate: string;
  status: 'Pending Moderation' | 'Published' | 'Hidden';
}

export const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    reviewerName: 'Karim Salameh',
    reviewerEmail: 'karim.s@student.edu',
    reviewerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    propertyTitle: 'Alpha Student Residence - Room 302',
    rating: 5,
    comment: 'Extremely clean facility, very responsive management, and great study atmosphere close to campus!',
    requestedDate: '2026-09-17',
    status: 'Pending Moderation',
  },
  {
    id: 'rev-2',
    reviewerName: 'Maya Yazigi',
    reviewerEmail: 'maya.y@student.edu',
    propertyTitle: 'University Heights - Studio B',
    rating: 4,
    comment: 'Great location and quiet neighbors. Utility bills were slightly higher than expected in winter, but overall worth it.',
    requestedDate: '2026-09-15',
    status: 'Published',
  },
  {
    id: 'rev-3',
    reviewerName: 'Ziad Rahal',
    reviewerEmail: 'ziad.r@student.edu',
    reviewerAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    propertyTitle: 'Cedar Campus Dorms - West Wing',
    rating: 2,
    comment: 'Wi-Fi was unreliable during exam week and maintenance took two days to fix the AC.',
    requestedDate: '2026-09-10',
    status: 'Hidden',
  },
];

export function ReviewsSidebar() {
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');

  const handleReviewAction = (id: string, status: 'Published' | 'Hidden') => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const handleDeleteReview = (id: string) => {
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const matchesDateFilter = (dateStr: string) => {
    if (dateFilter === 'ALL') return true;
    const itemDate = new Date(dateStr);
    const now = new Date('2026-09-18T14:14:55'); // Reference date
    const diffTime = now.getTime() - itemDate.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);

    if (dateFilter === 'today') return diffDays >= 0 && diffDays < 1;
    if (dateFilter === '7days') return diffDays >= 0 && diffDays <= 7;
    if (dateFilter === '30days') return diffDays >= 0 && diffDays <= 30;
    return true;
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const matchesSearch = [r.reviewerName, r.reviewerEmail, r.propertyTitle, r.comment].some(v => v.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchesRating = ratingFilter === 'ALL' || r.rating.toString() === ratingFilter;
      const matchesDate = matchesDateFilter(r.requestedDate);
      return matchesSearch && matchesStatus && matchesRating && matchesDate;
    });
  }, [reviews, searchQuery, statusFilter, ratingFilter, dateFilter]);

  const pendingCount = reviews.filter(r => r.status === 'Pending Moderation').length;

  return (
    <div className="space-y-5 w-full">
      <div className="bg-white p-5 rounded-2xl border border-brand-slate/10 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-brand-navy/5 border border-brand-navy/10 flex items-center justify-center text-brand-navy shrink-0">
            <MessageSquare className="w-5 h-5 text-brand-navy" />
          </div>
          <div>
            <h2 className="font-bold text-brand-navy text-sm md:text-base">Reviews & Moderation</h2>
            <p className="text-xs text-brand-slate">Moderate student feedback, rate student housing, and maintain rating standards.</p>
          </div>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/60 px-3.5 py-1.5 rounded-xl self-start md:self-auto">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-800">{pendingCount} Pending Moderation</span>
          </div>
        )}
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-brand-slate/10 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-brand-slate/60 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reviews, properties, or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-brand-light/30 border border-brand-slate/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy/15 focus:bg-white transition-all text-brand-navy placeholder:text-brand-slate/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-slate" />
            <span className="text-xs font-medium text-brand-slate">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold bg-brand-light/50 text-brand-navy border border-brand-slate/15 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-navy/15 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending Moderation">Pending Moderation</option>
              <option value="Published">Published</option>
              <option value="Hidden">Hidden</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" />
            <span className="text-xs font-medium text-brand-slate">Rating:</span>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="text-xs font-semibold bg-brand-light/50 text-brand-navy border border-brand-slate/15 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-navy/15 cursor-pointer"
            >
              <option value="ALL">All Stars</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-brand-slate" />
            <span className="text-xs font-medium text-brand-slate">Date:</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-xs font-semibold bg-brand-light/50 text-brand-navy border border-brand-slate/15 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-navy/15 cursor-pointer"
            >
              <option value="ALL">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-brand-slate/10 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-brand-navy">
            <thead className="bg-brand-light/50 border-b border-brand-slate/10 text-[11px] font-bold text-brand-slate uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Reviewer</th>
                <th className="py-3 px-3">Property Asset</th>
                <th className="py-3 px-3">Rating & Comment</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-slate/10">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((item) => (
                  <tr key={item.id} className="hover:bg-brand-light/20 transition-colors">
                    <td className="py-3.5 px-4 align-top">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-brand-navy/10 border border-brand-slate/10 shrink-0 flex items-center justify-center font-bold text-xs text-brand-navy">
                          {item.reviewerAvatar ? <img src={item.reviewerAvatar} alt="" className="w-full h-full object-cover" /> : item.reviewerName[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-brand-navy truncate max-w-[140px]">{item.reviewerName}</p>
                          <p className="text-[11px] text-brand-slate truncate max-w-[160px] flex items-center gap-1">
                            <Mail className="w-3 h-3 shrink-0 opacity-60" /> {item.reviewerEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 align-top">
                      <p className="font-semibold text-brand-navy truncate max-w-[160px] flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                        {item.propertyTitle}
                      </p>
                      <span className="text-[10px] text-brand-slate">{item.requestedDate}</span>
                    </td>
                    <td className="py-3.5 px-3 max-w-xs align-top">
                      <div className="flex items-center gap-1 mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${i < item.rating ? 'text-brand-gold fill-brand-gold' : 'text-brand-slate/30'}`} 
                          />
                        ))}
                        <span className="text-[11px] font-bold text-brand-navy ml-1">({item.rating}.0)</span>
                      </div>
                      <p className="text-xs text-brand-slate line-clamp-2 leading-relaxed">"{item.comment}"</p>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap align-top">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        item.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' :
                        item.status === 'Pending Moderation' ? 'bg-amber-50 text-amber-700 border-amber-200/60' :
                        'bg-rose-50 text-rose-700 border-rose-200/60'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap align-top">
                      <div className="flex items-center justify-end gap-2">
                        {item.status !== 'Published' && (
                          <button
                            onClick={() => handleReviewAction(item.id, 'Published')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs"
                            title="Publish Review"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Publish</span>
                          </button>
                        )}
                        {item.status !== 'Hidden' && (
                          <button
                            onClick={() => handleReviewAction(item.id, 'Hidden')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-600 hover:text-white transition-all shadow-2xs"
                            title="Hide Review"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Hide</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReview(item.id)}
                          className="p-1.5 rounded-lg text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-600 hover:text-white transition-all shadow-2xs"
                          title="Delete Review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-xs text-brand-slate font-medium">
                    No reviews found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReviewsSidebar;
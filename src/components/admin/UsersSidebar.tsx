'use client';

import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  Mail, 
  Search, 
  ShieldCheck, 
  Clock,
  UserCheck,
  SlidersHorizontal,
  Calendar
} from 'lucide-react';

export interface StudentRegistration {
  id: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  dormName: string;
  dormCategory: 'SHARED' | 'STUDIO' | 'DORM';
  requestedDate: string;
  status: 'Pending Review' | 'Active' | 'Rejected';
}

export interface OwnerSubmission {
  id: string;
  ownerName: string;
  ownerEmail: string;
  ownerAvatar?: string;
  propertyTitle: string;
  propertyType: 'SHARED' | 'STUDIO' | 'DORM';
  price: number;
  status: 'Pending Review' | 'Active' | 'Rejected';
  requestedDate?: string;
}

export const INITIAL_STUDENTS: StudentRegistration[] = [
  {
    id: 'std-1',
    studentName: 'Youssef Ahmad',
    studentEmail: 'youssef.ahmad@student.edu',
    studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    dormName: 'Alpha Student Residence - Room 302',
    dormCategory: 'SHARED',
    requestedDate: '2026-09-14',
    status: 'Pending Review',
  },
  {
    id: 'std-2',
    studentName: 'Nour El-Din',
    studentEmail: 'nour.din@student.edu',
    dormName: 'University Heights - Studio B',
    dormCategory: 'STUDIO',
    requestedDate: '2026-09-13',
    status: 'Pending Review',
  },
  {
    id: 'std-3',
    studentName: 'Sara Kassir',
    studentEmail: 'sara.kassir@student.edu',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    dormName: 'Cedar Campus Dorms - West Wing',
    dormCategory: 'DORM',
    requestedDate: '2026-09-11',
    status: 'Active',
  },
];

export const INITIAL_OWNERS: OwnerSubmission[] = [
  {
    id: 'own-1',
    ownerName: 'Tarek Zaiter',
    ownerEmail: 'tarek.z@hostproperties.com',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    propertyTitle: 'Modern 2-Bedroom Student Loft',
    propertyType: 'STUDIO',
    price: 450,
    status: 'Pending Review',
    requestedDate: '2026-09-14',
  },
  {
    id: 'own-2',
    ownerName: 'Raniah Haddad',
    ownerEmail: 'rania.h@beirutstays.com',
    propertyTitle: 'Campus Edge Shared Apartment',
    propertyType: 'SHARED',
    price: 280,
    status: 'Pending Review',
    requestedDate: '2026-09-12',
  },
  {
    id: 'own-3',
    ownerName: 'Ziad Kassab',
    ownerEmail: 'ziad.k@universitydorms.net',
    ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    propertyTitle: 'Cedar Deluxe Single Dorm',
    propertyType: 'DORM',
    price: 320,
    status: 'Active',
    requestedDate: '2026-09-10',
  },
];

export function UsersSidebar() {
  const [activeTab, setActiveTab] = useState<'students' | 'owners'>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');

  const [students, setStudents] = useState<StudentRegistration[]>(INITIAL_STUDENTS);
  const [owners, setOwners] = useState<OwnerSubmission[]>(INITIAL_OWNERS);

  const handleStudentAction = (id: string, status: 'Active' | 'Rejected') => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleOwnerAction = (id: string, status: 'Active' | 'Rejected') => {
    setOwners(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const matchesDateFilter = (dateStr?: string) => {
    if (dateFilter === 'ALL' || !dateStr) return true;
    const itemDate = new Date(dateStr);
    const now = new Date('2026-09-18T14:14:55');
    
    const diffTime = now.getTime() - itemDate.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);

    if (dateFilter === 'today') return diffDays >= 0 && diffDays < 1;
    if (dateFilter === '7days') return diffDays >= 0 && diffDays <= 7;
    if (dateFilter === '30days') return diffDays >= 0 && diffDays <= 30;
    return true;
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = [s.studentName, s.studentEmail, s.dormName].some(v => v.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
      const matchesDate = matchesDateFilter(s.requestedDate);
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [students, searchQuery, statusFilter, dateFilter]);

  const filteredOwners = useMemo(() => {
    return owners.filter(o => {
      const matchesSearch = [o.ownerName, o.ownerEmail, o.propertyTitle].some(v => v.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
      const matchesDate = matchesDateFilter(o.requestedDate);
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [owners, searchQuery, statusFilter, dateFilter]);

  const studentPending = students.filter(s => s.status === 'Pending Review').length;
  const ownerPending = owners.filter(o => o.status === 'Pending Review').length;

  return (
    <div className="space-y-5 w-full">
      <div className="bg-white p-5 rounded-2xl border border-brand-slate/10 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-brand-navy/5 border border-brand-navy/10 flex items-center justify-center text-brand-navy shrink-0">
            <ShieldCheck className="w-5 h-5 text-brand-navy" />
          </div>
          <div>
            <h2 className="font-bold text-brand-navy text-sm md:text-base">Directory & Access Control</h2>
            <p className="text-xs text-brand-slate">Manage verification requests, monitor roles, and secure platform compliance.</p>
          </div>
        </div>

        <div className="flex p-1 rounded-xl bg-brand-light/70 border border-brand-slate/10 self-start md:self-auto">
          <button
            onClick={() => { setActiveTab('students'); setStatusFilter('ALL'); setDateFilter('ALL'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'students' ? 'bg-white text-brand-navy shadow-2xs' : 'text-brand-slate hover:text-brand-navy'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-brand-gold" />
            Students
            {studentPending > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px]">
                {studentPending}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('owners'); setStatusFilter('ALL'); setDateFilter('ALL'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'owners' ? 'bg-white text-brand-navy shadow-2xs' : 'text-brand-slate hover:text-brand-navy'
            }`}
          >
            <Building2 className="w-4 h-4 text-brand-gold" />
            Property Owners
            {ownerPending > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px]">
                {ownerPending}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-brand-slate/10 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-brand-slate/60 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeTab === 'students' ? 'Search students or dorms...' : 'Search owners or properties...'}
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
              <option value="Pending Review">Pending Review</option>
              <option value="Active">Active</option>
              <option value="Rejected">Rejected</option>
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
          {activeTab === 'students' ? (
            <table className="w-full text-left text-xs text-brand-navy">
              <thead className="bg-brand-light/50 border-b border-brand-slate/10 text-[11px] font-bold text-brand-slate uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-3">Dormitory Info</th>
                  <th className="py-3 px-3 hidden md:table-cell">Request Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-slate/10">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((item) => (
                    <tr key={item.id} className="hover:bg-brand-light/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-brand-navy/10 border border-brand-slate/10 shrink-0 flex items-center justify-center font-bold text-xs text-brand-navy">
                            {item.studentAvatar ? <img src={item.studentAvatar} alt="" className="w-full h-full object-cover" /> : item.studentName[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-brand-navy truncate max-w-[150px]">{item.studentName}</p>
                            <p className="text-[11px] text-brand-slate truncate max-w-[170px] flex items-center gap-1">
                              <Mail className="w-3 h-3 shrink-0 opacity-60" /> {item.studentEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-brand-navy truncate max-w-[160px]">{item.dormName}</p>
                        <span className="text-[10px] font-bold text-brand-gold uppercase">{item.dormCategory} Tier</span>
                      </td>
                      <td className="py-3 px-3 hidden md:table-cell text-brand-slate whitespace-nowrap">
                        <span className="flex items-center gap-1 font-medium"><Clock className="w-3 h-3 opacity-60" /> {item.requestedDate}</span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {item.status === 'Pending Review' ? (
                          <div className="flex items-center justify-end gap-2">
                            <ActionBtn onClick={() => handleStudentAction(item.id, 'Active')} type="approve" />
                            <ActionBtn onClick={() => handleStudentAction(item.id, 'Rejected')} type="reject" />
                          </div>
                        ) : (
                          <VerifiedLabel />
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <EmptyRow colSpan={5} />
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs text-brand-navy">
              <thead className="bg-brand-light/50 border-b border-brand-slate/10 text-[11px] font-bold text-brand-slate uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Property Host</th>
                  <th className="py-3 px-3">Listing Asset</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-slate/10">
                {filteredOwners.length > 0 ? (
                  filteredOwners.map((item) => (
                    <tr key={item.id} className="hover:bg-brand-light/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-brand-navy/10 border border-brand-slate/10 shrink-0 flex items-center justify-center font-bold text-xs text-brand-navy">
                            {item.ownerAvatar ? <img src={item.ownerAvatar} alt="" className="w-full h-full object-cover" /> : item.ownerName[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-brand-navy truncate max-w-[150px]">{item.ownerName}</p>
                            <p className="text-[11px] text-brand-slate truncate max-w-[170px] flex items-center gap-1">
                              <Mail className="w-3 h-3 shrink-0 opacity-60" /> {item.ownerEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-brand-navy truncate max-w-[160px]">{item.propertyTitle}</p>
                        <span className="text-[10px] font-bold text-brand-gold uppercase">{item.propertyType}</span>
                      </td>
                      <td className="py-3 px-3 font-bold text-brand-navy whitespace-nowrap">
                        ${item.price} <span className="text-[10px] text-brand-slate font-normal">/mo</span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {item.status === 'Pending Review' ? (
                          <div className="flex items-center justify-end gap-2">
                            <ActionBtn onClick={() => handleOwnerAction(item.id, 'Active')} type="approve" />
                            <ActionBtn onClick={() => handleOwnerAction(item.id, 'Rejected')} type="reject" />
                          </div>
                        ) : (
                          <VerifiedLabel label="Published" />
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <EmptyRow colSpan={5} />
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    'Pending Review': 'bg-amber-50 text-amber-700 border-amber-200/60',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200/60',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-200/60',
  };

  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${styles[status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
      {status}
    </span>
  );
}

function ActionBtn({ onClick, type }: { onClick: () => void; type: 'approve' | 'reject' }) {
  const isApprove = type === 'approve';
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-2xs active:scale-95 ${
        isApprove 
          ? 'text-emerald-700 bg-emerald-50 border-emerald-200/80 hover:bg-emerald-600 hover:text-white hover:border-emerald-600' 
          : 'text-rose-700 bg-rose-50 border-rose-200/80 hover:bg-rose-600 hover:text-white hover:border-rose-600'
      }`}
    >
      {isApprove ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Approve</span>
        </>
      ) : (
        <>
          <XCircle className="w-3.5 h-3.5" />
          <span>Reject</span>
        </>
      )}
    </button>
  );
}

function VerifiedLabel({ label = 'Verified' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-brand-slate font-medium italic">
      <UserCheck className="w-3.5 h-3.5 opacity-60" /> {label}
    </span>
  );
}

function EmptyRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-10 text-center text-xs text-brand-slate font-medium">
        No records found matching your filters.
      </td>
    </tr>
  );
}

export default UsersSidebar;
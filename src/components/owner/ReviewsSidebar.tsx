"use client";

import { FileText, MessageSquare, CheckCircle2, XCircle, Inbox } from "lucide-react";

interface ReviewSidebarProps {
  activeReviewFilter: string;
  setActiveReviewFilter: (filter: string) => void;
  pendingCount?: number;
}

export function ReviewSidebar({
  activeReviewFilter,
  setActiveReviewFilter,
  pendingCount = 0,
}: ReviewSidebarProps) {
  const navItems = [
    { id: "ALL", label: "All Submissions", icon: Inbox },
    { id: "Pending", label: "Pending Review", icon: FileText, badge: pendingCount },
    { id: "Application", label: "Rental Applications", icon: FileText },
    { id: "Inquiry", label: "Student Inquiries", icon: MessageSquare },
    { id: "Approved", label: "Approved", icon: CheckCircle2 },
    { id: "Declined", label: "Declined", icon: XCircle },
  ];

  return (
    <aside className="w-64 bg-white border-r border-brand-slate/15 p-4 flex flex-col shrink-0 hidden lg:flex">
      <div className="mb-6 px-2">
        <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
          Review Filters
        </h3>
        <p className="text-[11px] text-brand-slate mt-0.5">
          Filter applications and student inquiries.
        </p>
      </div>

      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeReviewFilter === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveReviewFilter(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-brand-navy text-white shadow-sm"
                  : "text-brand-slate hover:bg-brand-light hover:text-brand-navy"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-brand-slate"}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 bg-brand-light rounded-xl border border-brand-slate/10 mt-auto">
        <h4 className="text-[11px] font-bold text-brand-navy mb-1">Quick Response Tip</h4>
        <p className="text-[10px] text-brand-slate leading-relaxed">
          Approving an application allows the student to proceed with the lease agreement.
        </p>
      </div>
    </aside>
  );
}

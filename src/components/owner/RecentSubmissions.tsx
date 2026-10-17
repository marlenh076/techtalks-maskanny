"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, GraduationCap, Home, Building } from "lucide-react";

export interface Submission {
  id: string;
  property: string;
  host: string;
  price: number;
  status: "Active" | "Approved" | "Pending Review" | "Rejected";
  category: "SHARED" | "STUDIO" | "DORM" | "APARTMENT";
  moderationStatus?: "pending" | "approved" | "rejected";
  visibilityStatus?: "Live" | "Hidden" | "Unavailable";
  imageUrl?: string;
  owner?: {
    name: string;
    phone: string;
    email: string;
  };
}

interface RecentSubmissionsProps {
  activeStatus?: "ALL" | "ACTIVE" | "REJECTED" | "PENDING REVIEW";
  activeCategory?: "ALL" | "SHARED" | "STUDIO" | "DORM" | "APARTMENT";
  submissions?: Submission[];
}

export function RecentSubmissions({
  activeStatus = "ALL",
  activeCategory = "ALL",
  submissions = [],
}: RecentSubmissionsProps) {
  const [showAll, setShowAll] = useState(false);

  const filteredSubmissions = submissions.filter((item) => {
    const matchesStatus =
      activeStatus === "ALL" ||
      (activeStatus === "PENDING REVIEW" && item.status === "Pending Review") ||
      (activeStatus === "ACTIVE" && item.status === "Active") ||
      (activeStatus === "REJECTED" && item.status === "Rejected");

    const matchesCategory = activeCategory === "ALL" || item.category === activeCategory;

    return matchesStatus && matchesCategory;
  });

  const displayedSubmissions = showAll ? filteredSubmissions : filteredSubmissions.slice(0, 6);

  const getCategoryIcon = (category: Submission["category"]) => {
    switch (category) {
      case "DORM":
        return <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />;
      case "STUDIO":
        return <Building className="w-3.5 h-3.5 text-blue-500" />;
      case "SHARED":
        return <Home className="w-3.5 h-3.5 text-emerald-500" />;
      case "APARTMENT":
        return <Building className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-brand-slate/15 shadow-sm overflow-hidden flex-1 w-full min-w-0">
      <div className="p-4 sm:p-5 border-b border-brand-slate/10 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-brand-navy text-sm sm:text-base">
            {activeStatus === "PENDING REVIEW"
              ? "Pending Approval Requests"
              : "Property Submissions"}
          </h3>
          <p className="text-xs text-brand-slate">
            Showing {displayedSubmissions.length} of {filteredSubmissions.length} entries
          </p>
        </div>

        {filteredSubmissions.length > 6 && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-semibold text-brand-navy hover:text-brand-gold flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg bg-brand-light cursor-pointer"
          >
            {showAll ? (
              <>
                Show Less <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                View All <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm text-brand-navy border-collapse">
          <thead className="bg-brand-light/50 border-b border-brand-slate/10 text-[11px] font-bold text-brand-slate uppercase tracking-wider">
            <tr>
              <th className="py-3 px-3 sm:px-4">Property</th>
              <th className="py-3 px-2 hidden md:table-cell">Type</th>
              <th className="py-3 px-2">Host</th>
              <th className="py-3 px-2">Price</th>
              <th className="py-3 px-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-slate/10">
            {displayedSubmissions.length > 0 ? (
              displayedSubmissions.map((submission) => {
                return (
                  <tr key={submission.id} className="hover:bg-brand-light/30 transition-colors">
                    <td className="py-3 px-3 sm:px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-brand-slate/15 shrink-0 shadow-2xs">
                          {submission.imageUrl ? (
                            <Image
                              unoptimized
                              width={44}
                              height={44}
                              src={submission.imageUrl}
                              alt={submission.property}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                              <Building className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <span className="font-semibold text-brand-navy max-w-[140px] sm:max-w-[180px] truncate block">
                          {submission.property}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-2 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                        {getCategoryIcon(submission.category)}
                        {submission.category}
                      </span>
                    </td>

                    <td className="py-3 px-2 text-brand-slate max-w-[100px] truncate">
                      {submission.host}
                    </td>

                    <td className="py-3 px-2 font-semibold text-brand-navy whitespace-nowrap">
                      ${submission.price}
                      <span className="text-[10px] text-brand-slate font-normal">/mo</span>
                    </td>

                    <td className="py-3 px-2 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                          submission.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                            : submission.status === "Pending Review"
                              ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                              : submission.status === "Approved"
                                ? "bg-brand-light text-brand-navy border border-brand-slate/20"
                                : "bg-rose-50 text-rose-700 border border-rose-200/60"
                        }`}
                      >
                        {submission.status}
                      </span>
                      {submission.moderationStatus && (
                        <span className="block mt-1 text-[10px] text-brand-slate">
                          Moderation: {submission.moderationStatus} · {submission.visibilityStatus}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-brand-slate">
                  No submissions match the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentSubmissions;

"use client";
import { useState } from "react";
import AdminAccessGuard, { useAdminSession } from "@/src/components/admin/AdminAccessGuard";
import DashboardSidebar from "@/src/components/admin/DashboardSidebar";
import AdminOverview from "@/src/components/admin/AdminOverview";
import AdminListings from "@/src/components/admin/AdminListings";
import UsersManagementView from "@/src/components/admin/UsersSidebar";
import ReportsSidebar from "@/src/components/admin/ReportsSidebar";
import ReviewsSidebar from "@/src/components/admin/ReviewsSidebar";
import SettingsView from "@/src/components/admin/SettingsSidebar";
import BoostingPlansPage from "@/src/components/admin/BoostingSidebar";
import type { DatePreset } from "@/src/features/admin/client/format";

const headings: Record<string, [string, string]> = {
  Dashboard: ["Welcome back, Admin!", "Current Maskanny totals and recorded growth."],
  Listings: ["Listings Management", "Review and manage property listings. Moderation approval alone does not publish a listing."],
  Users: ["Users & Access Control", "Browse real accounts, Hosts, and their property submissions."],
  Reports: ["Analytics & Reports", "Export supported user and listing summaries."],
  Reviews: ["Reviews & Moderation", "Review moderation will be available when its data model is defined."],
  Settings: ["Account Settings", "Manage your personal Admin profile and credentials."],
  Boosting: ["Boost Listings", "View property promotion requests and recorded payment information."],
};
function Dashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [overviewDate, setOverviewDate] = useState<DatePreset>("MONTH");
  const [listingDate, setListingDate] = useState<DatePreset | "ALL">("ALL");
  const [listingInitialStatus, setListingInitialStatus] = useState<"pending" | "all">("pending");
  const { profile, logout, loggingOut } = useAdminSession();
  const heading = headings[activeTab];
  const preset = activeTab === "Listings" ? listingDate : overviewDate;
  return <div className="flex flex-col md:flex-row min-h-screen bg-brand-light text-brand-navy w-full">
    <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} userEmail={profile.email} onLogout={logout} loggingOut={loggingOut} />
    <main className="flex-1 flex flex-col min-w-0">
      <div className="p-4 sm:p-8 space-y-6 max-w-[1600px] w-full mx-auto flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-brand-slate/15 shadow-sm shrink-0">
          <div><h2 className="text-xl font-bold text-brand-navy">{heading[0]}</h2><p className="text-xs text-brand-slate">{heading[1]}</p></div>
          {(activeTab === "Dashboard" || activeTab === "Listings") && <div className="inline-flex flex-wrap gap-1 p-1 bg-brand-light rounded-xl border border-brand-slate/10 text-xs font-semibold self-start sm:self-auto">
            {(activeTab === "Listings" ? ["ALL", "TODAY", "WEEK", "MONTH"] : ["TODAY", "WEEK", "MONTH", "YEAR"]).map(id =>
              <button key={id} type="button" onClick={() => activeTab === "Listings" ? setListingDate(id as DatePreset | "ALL") : setOverviewDate(id as DatePreset)}
                className={`px-3 py-1.5 rounded-lg transition-all ${preset === id ? "bg-white text-brand-navy shadow-sm font-bold" : "text-brand-slate hover:text-brand-navy"}`}>
                {{ ALL: "All Time", TODAY: "Today", WEEK: "Last 7 Days", MONTH: "Last 30 Days", YEAR: "Last 365 Days" }[id]}
              </button>)}
          </div>}
        </div>
        {activeTab === "Dashboard" ? <AdminOverview preset={overviewDate} onViewListings={status => { setListingInitialStatus(status); setActiveTab("Listings"); }} /> :
          activeTab === "Listings" ? <AdminListings preset={listingDate} initialStatus={listingInitialStatus} /> :
            activeTab === "Users" ? <UsersManagementView /> :
              activeTab === "Reports" ? <ReportsSidebar /> :
                activeTab === "Reviews" ? <ReviewsSidebar /> :
                  activeTab === "Boosting" ? <BoostingPlansPage /> : <SettingsView />}
      </div>
    </main>
  </div>;
}
export default function AdminDashboardPage() { return <AdminAccessGuard><Dashboard /></AdminAccessGuard>; }

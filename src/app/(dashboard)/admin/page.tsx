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
  Listings: [
    "Listings Management",
    "Review and manage property listings. Moderation approval alone does not publish a listing.",
  ],
  Users: ["Users & Access Control", "Browse real accounts, Hosts, and their property submissions."],
  Reports: ["Analytics & Reports", "Export supported user and listing summaries."],
  Reviews: [
    "Reviews & Moderation",
    "Review moderation will be available when its data model is defined.",
  ],
  Settings: ["Account Settings", "Manage your personal Admin profile and credentials."],
  Boosting: [
    "Boost Listings",
    "View property promotion requests and recorded payment information.",
  ],
};
function Dashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [overviewDate, setOverviewDate] = useState<DatePreset>("MONTH");
  const [listingDate, setListingDate] = useState<DatePreset | "ALL">("ALL");
  const [listingInitialStatus, setListingInitialStatus] = useState<"pending" | "all">("pending");
  const { profile, logout, loggingOut } = useAdminSession();
  const heading = headings[activeTab];
  const preset = activeTab === "Listings" ? listingDate : overviewDate;
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-brand-light text-brand-navy w-full min-w-0">
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userEmail={profile.email}
        onLogout={logout}
        loggingOut={loggingOut}
      />
      <main className="flex-1 flex flex-col w-full min-w-0">
        <div className="p-4 sm:p-8 space-y-6 max-w-[1600px] w-full min-w-0 mx-auto flex-1 flex flex-col">
          <div className="flex w-full max-w-full min-w-0 flex-col gap-4 overflow-hidden rounded-2xl border border-brand-slate/15 bg-white p-3 shadow-sm sm:p-5 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
            <div className="w-full min-w-0 lg:w-auto lg:min-w-[15rem] lg:flex-1">
              <h2 className="text-xl font-bold text-brand-navy">{heading[0]}</h2>
              <p className="text-xs text-brand-slate">{heading[1]}</p>
            </div>

            {(activeTab === "Dashboard" || activeTab === "Listings") && (
              <div className="w-full max-w-full min-w-0 lg:w-auto lg:flex-none">
                <div className="grid w-full max-w-full min-w-0 grid-cols-2 gap-1 rounded-xl border border-brand-slate/10 bg-brand-light p-1 text-[10px] font-semibold min-[390px]:grid-cols-4 min-[390px]:gap-0.5 sm:gap-1 lg:inline-flex lg:w-auto">
                  {(activeTab === "Listings"
                    ? ["ALL", "TODAY", "WEEK", "MONTH"]
                    : ["TODAY", "WEEK", "MONTH", "YEAR"]
                  ).map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() =>
                        activeTab === "Listings"
                          ? setListingDate(id as DatePreset | "ALL")
                          : setOverviewDate(id as DatePreset)
                      }
                      className={`flex min-h-9 w-full min-w-0 items-center justify-center rounded-lg px-0.5 py-2 text-center text-[10px] leading-tight transition-colors min-[390px]:px-1 lg:w-auto lg:min-w-[76px] lg:px-3 lg:text-xs ${
                        preset === id
                          ? "bg-white font-bold text-brand-navy shadow-sm"
                          : "text-brand-slate hover:bg-white/60 hover:text-brand-navy"
                      }`}
                    >
                      <span className="lg:hidden">
                        {
                          {
                            ALL: "All Time",
                            TODAY: "Today",
                            WEEK: "7 Days",
                            MONTH: "30 Days",
                            YEAR: "365 Days",
                          }[id]
                        }
                      </span>
                      <span className="hidden lg:inline">
                        {
                          {
                            ALL: "All Time",
                            TODAY: "Today",
                            WEEK: "Last 7 Days",
                            MONTH: "Last 30 Days",
                            YEAR: "Last 365 Days",
                          }[id]
                        }
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {activeTab === "Dashboard" ? (
            <AdminOverview
              preset={overviewDate}
              onViewListings={(status) => {
                setListingInitialStatus(status);
                setActiveTab("Listings");
              }}
            />
          ) : activeTab === "Listings" ? (
            <AdminListings preset={listingDate} initialStatus={listingInitialStatus} />
          ) : activeTab === "Users" ? (
            <UsersManagementView />
          ) : activeTab === "Reports" ? (
            <ReportsSidebar />
          ) : activeTab === "Reviews" ? (
            <ReviewsSidebar />
          ) : activeTab === "Boosting" ? (
            <BoostingPlansPage />
          ) : (
            <SettingsView />
          )}
        </div>
      </main>
    </div>
  );
}
export default function AdminDashboardPage() {
  return (
    <AdminAccessGuard>
      <Dashboard />
    </AdminAccessGuard>
  );
}

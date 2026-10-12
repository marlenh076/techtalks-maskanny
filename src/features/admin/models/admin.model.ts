import type { User } from "@/src/features/users/models/user.model";

export interface Page<T> { items: T[]; total: number; page: number; page_size: number }
export interface AdminActivity {
  activity_id: string; actor_id: string; action: string; entity_type: string;
  entity_id: string; reason: string | null; details: Record<string, unknown>; created_at: string;
}
export interface AdminProfile extends User { avatar_path: string | null; avatar_url?: string | null }
export interface AdminStatistics {
  as_of: string; from: string; to: string; users: number; hosts: number;
  properties: { total: number; pending: number; approved: number; active: number; rejected: number };
  property_types: Record<"dorm" | "studio" | "apartment", number>;
  trends: { day: string; metric: "users" | "hosts" | "properties"; value: number }[];
  unknown_host_creation_dates: number;
}
/** Existing dashboard's supported metrics only; approval does not mean publication. */
export type DashboardStatistics = Pick<AdminStatistics,
  "as_of" | "from" | "to" | "users" | "hosts" | "properties" | "property_types" | "unknown_host_creation_dates"
> & { trends: { day: string; metric: "users" | "hosts" | "properties"; value: number }[] };
export interface EmailChangeResult { email: string; requested_email: string; confirmation_required: boolean }
export interface AdminDirectoryEntry {
  user_id: string; host_id: string | null; firstname: string; lastname: string;
  email: string; phone: string; role: "user" | "admin";
  user_created_at: string; host_created_at: string | null;
  property_count: number; pending_property_count: number;
  approved_property_count: number; last_property_at: string | null;
}
export interface AdminPropertySubmission {
  property_id: string; title: string; property_type: "dorm" | "studio" | "apartment";
  price: number; approval_status: "pending" | "approved" | "rejected"; created_at: string;
}
export interface AdminDirectoryDetail {
  account: User & { host_id: string | null; host_since: string | null; property_count: number;
    approved_property_count: number; last_property_at: string | null };
  properties: AdminPropertySubmission[];
  property_total: number; properties_limit: number;
}
export type PaymentStatus = "not_submitted" | "legacy_unrecorded" | "pending" | "verified" | "rejected";
export type BoostStatus = "pending" | "active" | "expired" | "rejected";
export interface AdminBoostRequest {
  property_boosting_id: string; property_id: string; boosting_plan_id: string;
  created_at: string | null; stored_boost_status: BoostStatus; boost_status: BoostStatus;
  review_status: "pending" | "approved" | "rejected"; is_paid: boolean;
  start_date: string | null; end_date: string | null; legacy_payment: boolean;
  amount_due: number | null; quoted_currency: string | null; quoted_duration_days: number | null;
  property_title: string; property_type: "dorm" | "studio" | "apartment";
  property_status: "pending" | "approved" | "rejected";
  host_id: string; owner_user_id: string; owner_firstname: string;
  owner_lastname: string; owner_email: string;
  plan_name: string; plan_price: number; plan_currency: string | null;
  plan_duration_days: number; payment_status: PaymentStatus;
  payment: { payment_id: string; reference: string; amount: number; currency: string;
    status: Exclude<PaymentStatus,"not_submitted" | "legacy_unrecorded">; submitted_at: string;
    reviewed_at: string | null; reviewed_by: string | null; rejection_reason: string | null } | null;
}
export interface AdminBoostQueue extends Page<AdminBoostRequest> {
  payment_counts: Record<PaymentStatus, number>;
}

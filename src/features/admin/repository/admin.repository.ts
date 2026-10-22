import { createAuthenticatedClient } from "@/src/lib/supabase/client";
import type { Json, Database } from "@/src/lib/database/types";
import { databaseError } from "../service/errors";
import { sendEmail } from "@/src/lib/email/send-email";
import type {
  Page,
  AdminProfile,
  AdminStatistics,
  AdminBoostQueue,
  AdminBoostRequest,
  AdminDirectoryEntry,
  AdminDirectoryDetail,
} from "../models/admin.model";

type Functions = Database["public"]["Functions"];
export class AdminRepository {
  readonly client;
  constructor(token: string) {
    this.client = createAuthenticatedClient(token);
  }

  async rpc<K extends keyof Functions>(
    name: K,
    args: Functions[K]["Args"],
  ): Promise<Functions[K]["Returns"]> {
    const { data, error } = await this.client.rpc(name, args);
    if (error) databaseError(error, String(name));
    return data as Functions[K]["Returns"];
  }
  async list<T>(kind: string, filters: Record<string, unknown>): Promise<Page<T>> {
    return (await this.rpc("admin_list", {
      p_kind: kind,
      p_filters: filters as Json,
    })) as unknown as Page<T>;
  }
  async directory(
    kind: "users" | "hosts",
    filters: Record<string, unknown>,
  ): Promise<Page<AdminDirectoryEntry>> {
    return (await this.rpc("admin_directory_list", {
      p_kind: kind,
      p_filters: filters as Json,
    })) as unknown as Page<AdminDirectoryEntry>;
  }
  async directoryDetail(kind: "users" | "hosts", id: string): Promise<AdminDirectoryDetail | null> {
    return (await this.rpc("admin_directory_detail", {
      p_kind: kind,
      p_id: id,
    })) as unknown as AdminDirectoryDetail | null;
  }
  async boostQueue(filters: Record<string, unknown>): Promise<AdminBoostQueue> {
    return (await this.rpc("admin_boost_queue", {
      p_filters: filters as Json,
    })) as unknown as AdminBoostQueue;
  }
  async boostDetail(id: string): Promise<AdminBoostRequest | null> {
    return (await this.rpc("admin_boost_detail", {
      p_id: id,
    })) as unknown as AdminBoostRequest | null;
  }
  async signedBoostReceipt(path: string): Promise<string | null> {
    const { data, error } = await this.client.storage
      .from("boost-payment-receipts")
      .createSignedUrl(path, 300);
    return error ? null : (data?.signedUrl ?? null);
  }

  async decideBoostPayment(
    id: string,
    input: {
      payment_id: string | null;
      reference: string | null;
      decision: "approved" | "rejected";
      whish_confirmed: boolean;
      reason?: string;
    },
  ) {
    const boost = await this.rpc("admin_decide_boost_payment", {
      p_boost_id: id,
      p_payment_id: input.payment_id,
      p_reference: input.reference,
      p_decision: input.decision,
      p_whish_confirmed: input.whish_confirmed,
      p_reason: input.reason ?? null,
    });

    if (input.decision === "approved") {
      const { data, error } = await this.client.rpc(
        "get_host_boost_payment_notification_details",
        { p_boost_id: id },
      );

      if (error) {
        databaseError(error, "get_host_boost_payment_notification_details");
      }

      const owner = data?.[0];

      if (!owner?.owner_email) {
        throw new Error("Owner email was not found.");
      }

      if (!boost.end_date) {
        throw new Error("The approved boost has no expiry date.");
      }

      const escapeHtml = (value: string) =>
        value.replace(/[&<>"']/g, (character) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;",
          })[character]!,
        );

      const name = escapeHtml(owner.owner_firstname || "there");
      const property = escapeHtml(owner.property_title || "your property");
      const plan = escapeHtml(owner.plan_name || "Boost plan");

      const expiryDate = new Date(boost.end_date).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        },
      );

      await sendEmail({
        to: owner.owner_email,
        subject: "Your Maskanny property boost is approved!",
        html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#171717;line-height:1.6;">
          <div style="background:#000;color:#fff;padding:24px;text-align:center;">
            <h1 style="margin:0;font-size:26px;">Maskanny</h1>
          </div>

          <div style="padding:28px 24px;border:1px solid #e5e5e5;">
            <h2 style="margin-top:0;">Your boost is approved!</h2>

            <p>Hello ${name},</p>

            <p>
              Great news! Your payment has been verified and your property
              boost is now active on Maskanny.
            </p>

            <div style="background:#f7f7f7;padding:18px;margin:24px 0;border-left:4px solid #000;">
              <p style="margin:0 0 10px;">
                <strong>Property:</strong> ${property}
              </p>
              <p style="margin:0 0 10px;">
                <strong>Boost plan:</strong> ${plan}
              </p>
              <p style="margin:0;">
                <strong>Expires on:</strong> ${expiryDate}
              </p>
            </div>

            <p>
              Your boost will remain active until its expiry date.
              Thank you for choosing Maskanny!
            </p>

            <p style="margin-bottom:0;">
              Best regards,<br />
              <strong>Maskanny Team</strong>
            </p>
          </div>

          <p style="font-size:12px;color:#777;text-align:center;padding:12px;">
            This is an automated notification from Maskanny.
          </p>
        </div>
      `,
      });
    }

    return boost;
  }

  async statistics(from: string, to: string): Promise<AdminStatistics> {
    return (await this.rpc("admin_statistics", {
      p_from: from,
      p_to: to,
    })) as unknown as AdminStatistics;
  }
  async profile(): Promise<AdminProfile> {
    return (await this.rpc("admin_get_profile", {})) as unknown as AdminProfile;
  }
  async updateProfile(changes: Record<string, unknown>): Promise<AdminProfile> {
    return (await this.rpc("admin_update_profile", {
      p_changes: changes as Json,
    })) as unknown as AdminProfile;
  }
}

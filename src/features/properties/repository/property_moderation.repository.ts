import { createAuthenticatedClient } from "@/src/lib/supabase/client";
import { databaseError } from "@/src/features/admin/service/errors";
import { sendEmail } from "@/src/lib/email/send-email";

type ModerationDecision = "approved" | "rejected";

export class PropertyModerationRepository {
  private readonly supabase;

  constructor(accessToken: string) {
    this.supabase = createAuthenticatedClient(accessToken);
  }

  async approve(propertyId: string, reason?: string): Promise<void> {
    const { error } = await this.supabase.rpc("moderate_property", {
      p_property_id: propertyId,
      p_decision: "approved",
      p_reason: reason,
    });

    if (error) {
      databaseError(error);
    }

    await this.notifyOwner(propertyId, "approved");
  }

  async reject(propertyId: string, reason: string): Promise<void> {
    const { error } = await this.supabase.rpc("moderate_property", {
      p_property_id: propertyId,
      p_decision: "rejected",
      p_reason: reason,
    });

    if (error) {
      databaseError(error);
    }

    await this.notifyOwner(propertyId, "rejected", reason);
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  private async notifyOwner(
    propertyId: string,
    decision: ModerationDecision,
    reason?: string,
  ): Promise<void> {
    try {
      const { data, error } = await this.supabase.rpc("get_property_owner_notification_details", {
        p_property_id: propertyId,
      });

      if (error) {
        throw new Error(`Owner lookup failed: ${error.message}`);
      }

      const ownerDetails = data?.[0];

      if (!ownerDetails) {
        throw new Error(`No owner notification details found for property: ${propertyId}`);
      }

      const safeTitle = this.escapeHtml(ownerDetails.property_title);
      const safeName = this.escapeHtml(ownerDetails.owner_firstname);
      const ownerEmail = ownerDetails.owner_email;

      if (!ownerEmail?.trim()) {
        throw new Error("The property owner has no email address.");
      }

      const approved = decision === "approved";

      const subject = approved
        ? "Your Maskanny listing has been approved"
        : "Update on your Maskanny listing";

      const safeReason = this.escapeHtml(
        reason?.trim() || "Please contact the Maskanny team for more information.",
      );

      const html = approved
        ? `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Your listing has been approved!</h2>
          <p>Hello ${safeName},</p>
          <p>Your Maskanny listing <strong>${safeTitle}</strong> has been approved by our team.</p>
          <p>Your listing can now be shown to students on Maskanny.</p>
          <p>Thank you for using Maskanny!</p>
        </div>
      `
        : `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Update on your Maskanny listing</h2>
          <p>Hello ${safeName},</p>
          <p>Your listing <strong>${safeTitle}</strong> was not approved at this time.</p>
          <p><strong>Reason:</strong> ${safeReason}</p>
          <p>Please review the reason and make the necessary changes before resubmitting.</p>
          <p>Thank you,<br />The Maskanny Team</p>
        </div>
      `;

      await sendEmail({
        to: ownerEmail,
        subject,
        html,
      });

      console.info(`Property moderation email sent for ${propertyId} (${decision}).`);
    } catch (error) {
      console.error("Failed to send property moderation email:", error);
    }
  }
}

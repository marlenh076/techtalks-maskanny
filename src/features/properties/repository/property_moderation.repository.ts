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


      const html = `
  <div style="margin:0; padding:0; background-color:#f5f5f5; font-family:Arial,Helvetica,sans-serif; color:#111111;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f5f5f5; padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px; background-color:#ffffff; border:1px solid #e5e5e5;">

            <!-- Header -->
            <tr>
              <td style="padding:26px 32px; border-bottom:1px solid #e5e5e5;">
                <p style="margin:0; font-size:24px; font-weight:700; letter-spacing:-0.7px; color:#111111;">
                  Maskanny
                </p>
                <p style="margin:6px 0 0; font-size:12px; color:#777777;">
                  Student Housing
                </p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 12px; font-size:12px; font-weight:600; letter-spacing:1px; color:#777777;">
                  LISTING NOTIFICATION
                </p>

                <h1 style="margin:0 0 24px; font-size:25px; line-height:1.35; font-weight:600; color:#111111;">
                  ${approved
          ? "Your listing has been approved"
          : "Update on your Maskanny listing"
        }
                </h1>

                <p style="margin:0 0 16px; font-size:15px; line-height:1.7; color:#333333;">
                  Hello ${safeName},
                </p>

                ${approved
          ? `
                      <p style="margin:0 0 16px; font-size:15px; line-height:1.7; color:#333333;">
                        Great news! Your listing <strong style="color:#111111;">${safeTitle}</strong> has been approved by our team.
                      </p>
                      <p style="margin:0 0 24px; font-size:15px; line-height:1.7; color:#333333;">
                        Your listing can now be shown to students on Maskanny.
                      </p>
                    `
          : `
                      <p style="margin:0 0 16px; font-size:15px; line-height:1.7; color:#333333;">
                        Your listing <strong style="color:#111111;">${safeTitle}</strong> was not approved at this time.
                      </p>

                      <div style="margin:20px 0; padding:16px; background-color:#f7f7f7; border-left:3px solid #111111;">
                        <p style="margin:0 0 8px; font-size:13px; font-weight:600; color:#111111;">
                          Reason for rejection
                        </p>
                        <p style="margin:0; font-size:14px; line-height:1.7; color:#333333;">
                          ${safeReason}
                        </p>
                      </div>

                      <p style="margin:0 0 24px; font-size:15px; line-height:1.7; color:#333333;">
                        Please review the reason above, make the necessary changes, and resubmit your listing for review.
                      </p>
                    `
        }

                <p style="margin:0; font-size:15px; line-height:1.7; color:#333333;">
                  Best regards,<br />
                  <strong style="color:#111111;">Maskanny Team</strong>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:22px 32px; border-top:1px solid #e5e5e5; background-color:#fafafa;">
                <p style="margin:0 0 8px; font-size:12px; line-height:1.6; color:#777777;">
                  Maskanny · Student Housing
                </p>
                <p style="margin:0; font-size:12px; line-height:1.6; color:#777777;">
                  This is an automated notification from Maskanny.
                </p>
                <p style="margin:12px 0 0; font-size:12px; color:#999999;">
                  © ${new Date().getFullYear()} Maskanny. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
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

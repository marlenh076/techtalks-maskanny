import { createAuthenticatedClient } from "@/src/lib/supabase/client";
import type { Database } from "@/src/lib/database/types";
import { sendEmail } from "@/src/lib/email/send-email";

const RECEIPT_BUCKET = "boost-payment-receipts";
export type BoostPayment = Database["public"]["Tables"]["boost_payment"]["Row"];
export type BoostPaymentStatus = Pick<
  BoostPayment,
  | "payment_id"
  | "status"
  | "reference"
  | "amount"
  | "currency"
  | "submitted_at"
  | "rejection_reason"
>;

export class HostBoostPaymentError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 403 | 404 | 409 | 413 | 415 | 502,
  ) {
    super(message);
  }
}

export class BoostPaymentRepository {
  private client;

  constructor(accessToken: string) {
    this.client = createAuthenticatedClient(accessToken);
  }

  async getLatest(boostId: string): Promise<BoostPaymentStatus | null> {
    const { data, error } = await this.client.rpc("get_host_boost_payment_status", {
      p_boost_id: boostId,
    });
    if (error?.code === "42501") throw new HostBoostPaymentError("Forbidden", 403);
    if (error) throw new HostBoostPaymentError("Could not load payment status", 502);
    return data as BoostPaymentStatus | null;
  }

  async uploadReceipt(path: string, bytes: Uint8Array, contentType: string): Promise<boolean> {
    const { error } = await this.client.storage
      .from(RECEIPT_BUCKET)
      .upload(path, new Blob([Uint8Array.from(bytes)], { type: contentType }), {
        contentType,
        upsert: false,
        cacheControl: "0",
      });
    if (!error) return true;
    if (error.status === 409 || error.statusCode === "409") return false;
    throw new HostBoostPaymentError("Receipt upload failed", 502);
  }

  async removeUnsubmittedReceipt(path: string): Promise<void> {
    // The storage DELETE policy refuses a path already attached to any payment.
    await this.client.storage.from(RECEIPT_BUCKET).remove([path]);
  }

  async submit(
    boostId: string,
    reference: string | null,
    receiptPath: string | null,
  ): Promise<BoostPayment> {
    const { data, error } = await this.client.rpc("submit_host_boost_payment", {
      p_boost_id: boostId,
      p_reference: reference,
      p_receipt_path: receiptPath,
    });
    if (error) {
      switch (error.code) {
        case "42501":
          throw new HostBoostPaymentError("Forbidden", 403);
        case "M4040":
          throw new HostBoostPaymentError("Boost request not found", 404);
        case "M4041":
          throw new HostBoostPaymentError("Boosting plan not found", 404);
        case "M4090":
        case "23505":
          throw new HostBoostPaymentError(
            "Payment submission conflicts with an existing payment",
            409,
          );
        case "M4092":
          throw new HostBoostPaymentError("Boosting plan quote is unavailable", 409);
        case "22023":
          throw new HostBoostPaymentError("Invalid payment evidence", 400);
        default:
          throw new HostBoostPaymentError("Payment submission failed", 502);
      }
    }
    if (
      !data ||
      typeof data !== "object" ||
      Array.isArray(data) ||
      data.property_boosting_id !== boostId ||
      data.receipt_path !== receiptPath ||
      data.status !== "pending" ||
      typeof data.payment_id !== "string"
    ) {
      throw new HostBoostPaymentError("Payment submission returned an invalid response", 502);
    }

    const payment = data as unknown as BoostPayment;

    // Send the confirmation email after payment submission succeeds.
    // Email failure must not undo the saved payment submission.
    try {
      const { data: ownerData, error: ownerError } = await this.client.rpc(
        "get_host_boost_payment_notification_details",
        {
          p_boost_id: boostId,
        },
      );

      if (ownerError) {
        throw new Error(ownerError.message);
      }

      const owner = ownerData?.[0];

      if (!owner?.owner_email) {
        throw new Error("Owner email was not found.");
      }

      const escapeHtml = (value: string) =>
        value.replace(/[&<>"']/g, (character) => {
          const entities: Record<string, string> = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;",
          };

          return entities[character];
        });

      const name = escapeHtml(owner.owner_firstname || "there");
      const property = escapeHtml(owner.property_title);
      const plan = escapeHtml(owner.plan_name);

      const amount =
        owner.amount_due == null
          ? ""
          : `<p><strong>Amount:</strong> ${escapeHtml(
            String(owner.amount_due),
          )} ${escapeHtml(owner.currency || "")}</p>`;


      await sendEmail({
        to: owner.owner_email,
        subject: "We received your Maskanny boost payment confirmation",
        html: `
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

              <!-- Main content -->
              <tr>
                <td style="padding:32px;">
                  <p style="margin:0 0 12px; font-size:12px; font-weight:600; letter-spacing:1px; color:#777777;">
                    PAYMENT NOTIFICATION
                  </p>

                  <h1 style="margin:0 0 24px; font-size:25px; line-height:1.35; font-weight:600; color:#111111;">
                    Payment confirmation received
                  </h1>

                  <p style="margin:0 0 16px; font-size:15px; line-height:1.7; color:#333333;">
                    Hello ${name},
                  </p>

                  <p style="margin:0 0 24px; font-size:15px; line-height:1.7; color:#333333;">
                    We've received your payment confirmation for
                    <strong style="color:#111111;">${property}</strong>.
                    Thank you for submitting your payment details.
                  </p>

                  <!-- Payment details -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e5e5e5; margin:0 0 24px;">
                    <tr>
                      <td colspan="2" style="padding:14px 16px; background-color:#fafafa; border-bottom:1px solid #e5e5e5;">
                        <p style="margin:0; font-size:14px; font-weight:600; color:#111111;">
                          Payment details
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:14px 16px; font-size:14px; color:#777777; border-bottom:1px solid #eeeeee;">
                        Property
                      </td>
                      <td align="right" style="padding:14px 16px; font-size:14px; font-weight:600; color:#111111; border-bottom:1px solid #eeeeee;">
                        ${property}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:14px 16px; font-size:14px; color:#777777; border-bottom:1px solid #eeeeee;">
                        Boosting plan
                      </td>
                      <td align="right" style="padding:14px 16px; font-size:14px; font-weight:600; color:#111111; border-bottom:1px solid #eeeeee;">
                        ${plan}
                      </td>
                    </tr>
                    ${owner.amount_due != null
            ? `
                          <tr>
                            <td style="padding:14px 16px; font-size:14px; color:#777777; border-bottom:1px solid #eeeeee;">
                              Amount
                            </td>
                            <td align="right" style="padding:14px 16px; font-size:14px; font-weight:600; color:#111111; border-bottom:1px solid #eeeeee;">
                              ${escapeHtml(String(owner.amount_due))} ${escapeHtml(owner.currency || "")}
                            </td>
                          </tr>
                        `
            : ""
          }
                    <tr>
                      <td style="padding:14px 16px; font-size:14px; color:#777777;">
                        Status
                      </td>
                      <td align="right" style="padding:14px 16px; font-size:14px; font-weight:600; color:#111111;">
                        Pending verification
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0 0 16px; font-size:15px; line-height:1.7; color:#333333;">
                    Our team will review your payment submission. Your boost will only be activated after your payment has been verified and approved.
                  </p>

                  <p style="margin:24px 0 0; font-size:15px; line-height:1.7; color:#333333;">
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
  `,
      });


      console.info("Boost payment confirmation email sent:", payment.payment_id);
    } catch (emailError) {
      console.error("Failed to send boost payment confirmation email:", emailError);
    }

    return payment;
  }
}

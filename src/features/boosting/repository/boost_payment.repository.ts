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
          <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #2B4162;">
            <h2>Payment confirmation received</h2>
            <p>Hello ${name},</p>
            <p>We've received your payment confirmation for
              <strong>${property}</strong>.</p>
            <p><strong>Boosting plan:</strong> ${plan}</p>
            ${amount}
            <p><strong>Status:</strong> Pending verification</p>
            <p>Our team will review your payment. Your boost will only be
              activated after your payment has been verified and approved.</p>
            <p>Thank you for choosing Maskanny!</p>
            <p>The Maskanny Team</p>
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

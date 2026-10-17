import { HostRepository } from "@/src/features/users/repository/host.repository";
import { PropertyRepository } from "@/src/features/properties/repository/property.repository";
import { PropertyBoostingRepository } from "../repository/property_boosting.repository";
import { BoostingPlanRepository } from "../repository/boosting_plan.repository";
import {
  BoostPaymentRepository,
  HostBoostPaymentError,
} from "../repository/boost_payment.repository";

export class HostBoostPaymentService {
  constructor(
    private accessToken: string,
    private userId: string,
  ) {}

  async getLatest(boostId: string) {
    const host = await new HostRepository(this.accessToken).getByUserId(this.userId);
    if (!host) throw new HostBoostPaymentError("Host access required", 403);
    const boost = await new PropertyBoostingRepository(this.accessToken).getById(boostId);
    if (!boost) throw new HostBoostPaymentError("Boost request not found", 404);
    const property = await new PropertyRepository(this.accessToken).getById(boost.property_id);
    if (!property || property.host_id !== host.host_id) {
      throw new HostBoostPaymentError("Forbidden", 403);
    }
    return new BoostPaymentRepository(this.accessToken).getLatest(boostId);
  }

  async submit(
    boostId: string,
    reference: string | null,
    bytes: Uint8Array | null,
    format: { extension: string; contentType: string } | null,
  ) {
    const host = await new HostRepository(this.accessToken).getByUserId(this.userId);
    if (!host) throw new HostBoostPaymentError("Host access required", 403);

    const boost = await new PropertyBoostingRepository(this.accessToken).getById(boostId);
    if (!boost) throw new HostBoostPaymentError("Boost request not found", 404);
    const property = await new PropertyRepository(this.accessToken).getById(boost.property_id);
    if (!property || property.host_id !== host.host_id) {
      throw new HostBoostPaymentError("Forbidden", 403);
    }
    if (
      property.approval_status !== "approved" ||
      boost.status !== "pending" ||
      boost.is_paid ||
      boost.review_status === "rejected"
    ) {
      throw new HostBoostPaymentError("Boost is not eligible for payment submission", 409);
    }
    const plan = await new BoostingPlanRepository().getById(boost.boosting_plan_id);
    if (!plan) throw new HostBoostPaymentError("Boosting plan not found", 404);
    if (!plan.currency || plan.price <= 0 || plan.duration_days <= 0) {
      throw new HostBoostPaymentError("Boosting plan quote is unavailable", 409);
    }

    const digest =
      bytes && format
        ? new Uint8Array(await crypto.subtle.digest("SHA-256", Uint8Array.from(bytes)))
        : null;
    const hash =
      digest && Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
    const receiptPath = hash && format ? `${boostId}/${hash}.${format.extension}` : null;
    const repository = new BoostPaymentRepository(this.accessToken);
    const uploadedNew =
      receiptPath && bytes && format
        ? await repository.uploadReceipt(receiptPath, bytes, format.contentType)
        : false;
    try {
      return await repository.submit(boostId, reference, receiptPath);
    } catch (error) {
      if (uploadedNew && receiptPath) {
        try {
          await repository.removeUnsubmittedReceipt(receiptPath);
        } catch {
          /* An attached receipt is immutable; orphan cleanup is best effort. */
        }
      }
      throw error;
    }
  }
}

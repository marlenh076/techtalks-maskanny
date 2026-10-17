import { authorized, body, json, type IdContext } from "@/src/features/admin/http";
import {
  boostPaymentDecisionSchema,
  uuidSchema,
} from "@/src/features/admin/validation/admin.schema";
import { AdminError } from "@/src/features/admin/service/errors";

export async function GET(request: Request, context: IdContext) {
  return authorized(request, async (repo) => {
    const id = uuidSchema.parse((await context.params).id);
    const detail = await repo.boostDetail(id);
    if (!detail) throw new AdminError("Boost request not found", 404);
    if (!detail.payment?.receipt_path) return json(detail);
    const receiptUrl = await repo.signedBoostReceipt(detail.payment.receipt_path);
    return json({ ...detail, payment: { ...detail.payment, receipt_url: receiptUrl } });
  });
}

export async function POST(request: Request, context: IdContext) {
  return authorized(request, async (repo) => {
    const id = uuidSchema.parse((await context.params).id);
    const input = await body(request, boostPaymentDecisionSchema);
    const boost = await repo.decideBoostPayment(id, input);
    return json({
      message:
        input.decision === "approved"
          ? "Payment verified and boost activated"
          : input.payment_id
            ? "Payment rejected"
            : "Boost request rejected",
      boost,
    });
  });
}

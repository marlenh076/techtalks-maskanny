import { z } from "zod";
import { getAccessToken, getCurrentUser } from "@/src/lib/supabase/auth";
import { HostBoostPaymentService } from "@/src/features/boosting/service/host_boost_payment";
import { HostBoostPaymentError } from "@/src/features/boosting/repository/boost_payment.repository";
import {
  boostPaymentReferenceSchema,
  MAX_BOOST_PAYMENT_BODY_SIZE,
  MAX_BOOST_RECEIPT_SIZE,
  receiptFormat,
} from "@/src/features/boosting/validation/boost_payment.schema";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Context) {
  try {
    const id = (await params).id;
    if (!z.uuid().safeParse(id).success) {
      return Response.json({ error: "Invalid boost request ID" }, { status: 400 });
    }
    const token = getAccessToken(request);
    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const user = await getCurrentUser(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const payment = await new HostBoostPaymentService(token, user.id).getLatest(id);
    return Response.json(
      {
        payment: payment && {
          payment_id: payment.payment_id,
          status: payment.status,
          reference: payment.reference,
          amount: payment.amount,
          currency: payment.currency,
          submitted_at: payment.submitted_at,
          rejection_reason: payment.rejection_reason,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof HostBoostPaymentError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("[host.payment] Unexpected status lookup failure");
    return Response.json({ error: "Could not load payment status" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Context) {
  try {
    const id = (await params).id;
    if (!z.uuid().safeParse(id).success) {
      return Response.json({ error: "Invalid boost request ID" }, { status: 400 });
    }
    const token = getAccessToken(request);
    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const user = await getCurrentUser(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().startsWith("multipart/form-data;")) {
      return Response.json({ error: "Multipart form data required" }, { status: 415 });
    }
    const declaredSize = Number(request.headers.get("content-length"));
    if (declaredSize > MAX_BOOST_PAYMENT_BODY_SIZE) {
      return Response.json({ error: "Payment submission exceeds size limit" }, { status: 413 });
    }
    const reader = request.body?.getReader();
    if (!reader) return Response.json({ error: "Payment evidence required" }, { status: 400 });
    const chunks: Uint8Array[] = [];
    let total = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > MAX_BOOST_PAYMENT_BODY_SIZE) {
          await reader.cancel();
          return Response.json({ error: "Payment submission exceeds size limit" }, { status: 413 });
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    const uploadBody = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      uploadBody.set(chunk, offset);
      offset += chunk.byteLength;
    }
    let form: FormData;
    try {
      form = await new Response(uploadBody as BodyInit, {
        headers: { "Content-Type": contentType },
      }).formData();
    } catch {
      return Response.json({ error: "Invalid multipart body" }, { status: 400 });
    }
    if (
      [...form.keys()].some((key) => key !== "reference" && key !== "receipt") ||
      form.getAll("reference").length > 1 ||
      form.getAll("receipt").length > 1
    ) {
      return Response.json(
        { error: "At most one receipt and one reference are allowed" },
        { status: 400 },
      );
    }
    const parsed = boostPaymentReferenceSchema.safeParse(form.get("reference") ?? "");
    if (!parsed.success)
      return Response.json({ error: "Invalid transaction reference" }, { status: 400 });
    const file = form.get("receipt");
    if (
      file !== null &&
      (!(file instanceof File) || file.size === 0 || file.size > MAX_BOOST_RECEIPT_SIZE)
    ) {
      return Response.json({ error: "Receipt must be a file up to 5 MiB" }, { status: 400 });
    }
    const bytes = file instanceof File ? new Uint8Array(await file.arrayBuffer()) : null;
    const format = file instanceof File && bytes ? receiptFormat(bytes, file.type) : null;
    if (file !== null && !format)
      return Response.json({ error: "Receipt must be a JPEG, PNG, or PDF" }, { status: 415 });

    const payment = await new HostBoostPaymentService(token, user.id).submit(
      id,
      parsed.data,
      bytes,
      format,
    );
    return Response.json(payment, {
      status: 202,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof HostBoostPaymentError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("[host.payment] Unexpected submission failure");
    return Response.json({ error: "Payment submission failed" }, { status: 500 });
  }
}

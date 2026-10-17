import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { recordPropertyView } from "@/src/features/properties/repository/property_view.repository";
import { createCookieClient } from "@/src/lib/supabase/cookie-client";

const cookieName = "maskanny_view_visitor";

function signature(id: string, key: string) {
  return createHmac("sha256", key).update(id).digest("hex");
}

function visitorId(cookie: string | undefined, key: string): string | null {
  if (!cookie) return null;
  const [id, digest] = cookie.split(".");
  if (!z.uuid().safeParse(id).success || !/^[0-9a-f]{64}$/.test(digest ?? "")) return null;
  const expected = Buffer.from(signature(id, key), "hex");
  return timingSafeEqual(expected, Buffer.from(digest, "hex")) ? id : null;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: propertyId } = await params;
  if (!z.uuid().safeParse(propertyId).success) {
    return NextResponse.json({ error: "Invalid property ID" }, { status: 400 });
  }
  const origin = request.headers.get("origin");
  if (
    (origin && origin !== request.nextUrl.origin) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return NextResponse.json({ error: "Tracking unavailable" }, { status: 503 });

  // Dashboard users may open a public listing in another tab. Their visits
  // should not appear in the Host's student-view chart.
  const auth = await createCookieClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (user) {
    const [profile, host] = await Promise.all([
      auth.from("user").select("role").eq("user_id", user.id).maybeSingle(),
      auth.from("host").select("host_id").eq("user_id", user.id).maybeSingle(),
    ]);
    if (profile.error || host.error) {
      console.error("Could not determine public-view visitor type", {
        profileError: profile.error?.message,
        hostError: host.error?.message,
      });
      return NextResponse.json({ error: "Could not determine visitor type" }, { status: 503 });
    }
    if (profile.data?.role === "admin" || host.data) {
      return new NextResponse(null, { status: 204 });
    }
  }

  const existing = visitorId(request.cookies.get(cookieName)?.value, key);
  const id = existing ?? randomUUID();
  const visitorKey = createHmac("sha256", key).update(`${propertyId}:${id}`).digest("hex");
  try {
    const live = await recordPropertyView(propertyId, visitorKey);
    if (!live) return NextResponse.json({ error: "Property not found" }, { status: 404 });
    const response = new NextResponse(null, { status: 204 });
    if (!existing)
      response.cookies.set(cookieName, `${id}.${signature(id, key)}`, {
        httpOnly: true,
        secure: request.nextUrl.protocol === "https:",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    return response;
  } catch (error) {
    console.error("Could not record property view", error);
    return NextResponse.json({ error: "Could not record property view" }, { status: 500 });
  }
}

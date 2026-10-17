import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAccessToken, getCurrentUser } from "@/src/lib/supabase/auth";
import { createAuthenticatedClient } from "@/src/lib/supabase/client";
import { HostRepository } from "@/src/features/users/repository/host.repository";
import { viewRange } from "@/src/features/properties/service/property-view-analytics";

const periodSchema = z.enum(["ALL", "TODAY", "WEEK", "MONTH"]);

export async function GET(request: NextRequest) {
  const period = periodSchema.safeParse(request.nextUrl.searchParams.get("period") ?? "ALL");
  if (!period.success) return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  const token = getAccessToken(request);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const host = await new HostRepository(token).getByUserId(user.id);
    if (!host) return NextResponse.json({ error: "Host access required" }, { status: 403 });
    const range = viewRange(period.data);
    const { data, error } = await createAuthenticatedClient(token).rpc("host_property_view_daily", {
      p_from: range.from,
      p_to: range.to,
    });
    if (error) throw new Error(error.message);
    return NextResponse.json({ period: period.data, ...range, daily: data ?? [] });
  } catch (error) {
    console.error("Could not fetch Host views", error);
    return NextResponse.json({ error: "Could not fetch views" }, { status: 500 });
  }
}

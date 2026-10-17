import { NextRequest, NextResponse } from "next/server";
import { PropertyBoostingService } from "@/src/features/boosting/service/property_boosting";
import { PropertyBoostingRepository } from "@/src/features/boosting/repository/property_boosting.repository";
import { getAccessToken, getCurrentUser } from "@/src/lib/supabase/auth";
import { HostRepository } from "@/src/features/users/repository/host.repository";
import { PropertyRepository } from "@/src/features/properties/repository/property.repository";
import { z } from "zod";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!z.uuid().safeParse(id).success) {
      return NextResponse.json({ error: "Invalid property ID" }, { status: 400 });
    }

    const token = getAccessToken(request);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const host = await new HostRepository(token).getByUserId(user.id);
    if (!host) return NextResponse.json({ error: "Host access required" }, { status: 403 });
    const property = await new PropertyRepository(token).getById(id);
    if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });
    if (property.host_id !== host.host_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const propertyBoostingRepository = new PropertyBoostingRepository(token);

    const propertyBoostingService = new PropertyBoostingService(propertyBoostingRepository);

    const propertyBoosting = await propertyBoostingService.getCurrentByPropertyId(id);

    return NextResponse.json(propertyBoosting, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "Failed to fetch property boosting" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAccessToken, getCurrentUser } from "@/src/lib/supabase/auth";
import { HostRepository } from "@/src/features/users/repository/host.repository";
import { PropertyRepository } from "@/src/features/properties/repository/property.repository";
import { PropertyService } from "@/src/features/properties/service/property";

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
    if (!host) {
      return NextResponse.json({ error: "Host access required" }, { status: 403 });
    }

    const property = await new PropertyService(new PropertyRepository(token)).getById(id);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }
    if (property.host_id !== host.host_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch host property" }, { status: 500 });
  }
}

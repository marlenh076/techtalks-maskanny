import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { PropertyModerationReadRepository } from "@/src/features/properties/repository/property_moderation_read.repository";
import { PropertyModerationReadService } from "@/src/features/properties/service/property_moderation_read";
import { getCurrentAdmin } from "@/src/features/users/service/current_admin";
import { getAccessToken } from "@/src/lib/supabase/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getCurrentAdmin(request);

    if (!admin.authorized) {
      return NextResponse.json(
        { error: admin.status === 401 ? "Unauthorized" : "Forbidden" },
        { status: admin.status },
      );
    }

    const { id } = await params;
    if (!z.uuid().safeParse(id).success) {
      return NextResponse.json({ error: "Invalid property ID" }, { status: 400 });
    }

    const service = new PropertyModerationReadService(
      new PropertyModerationReadRepository(getAccessToken(request)!),
    );
    const property = await service.getById(id);

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch moderation property" },
      { status: 500 },
    );
  }
}

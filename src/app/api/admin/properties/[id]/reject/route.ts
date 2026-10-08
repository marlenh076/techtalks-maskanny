import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  PropertyModerationError,
  PropertyModerationRepository,
} from "@/src/features/properties/repository/property_moderation.repository";
import { PropertyModerationService } from "@/src/features/properties/service/property_moderation";
import { getCurrentAdmin } from "@/src/features/users/service/current_admin";
import { getAccessToken } from "@/src/lib/supabase/auth";

export async function POST(
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

    const token = getAccessToken(request)!;
    const service = new PropertyModerationService(
      new PropertyModerationRepository(token),
    );
    await service.reject(id);

    return NextResponse.json({ message: "Property rejected" });
  } catch (error) {
    if (error instanceof PropertyModerationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return NextResponse.json(
      { error: "Failed to reject property" },
      { status: 500 },
    );
  }
}

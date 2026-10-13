import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { PropertyModerationReadRepository } from "@/src/features/properties/repository/property_moderation_read.repository";
import { PropertyModerationReadService } from "@/src/features/properties/service/property_moderation_read";
import { getCurrentAdmin } from "@/src/features/users/service/current_admin";
import { getAccessToken } from "@/src/lib/supabase/auth";

const statusSchema = z.enum(["pending", "approved", "rejected"]);

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin(request);

    if (!admin.authorized) {
      return NextResponse.json(
        { error: admin.status === 401 ? "Unauthorized" : "Forbidden" },
        { status: admin.status },
      );
    }

    const statuses = request.nextUrl.searchParams.getAll("status");
    const status = statusSchema.safeParse(
      statuses.length === 0 ? "pending" : statuses[0],
    );
    if (statuses.length > 1 || !status.success) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const service = new PropertyModerationReadService(
      new PropertyModerationReadRepository(getAccessToken(request)!),
    );
    const properties = await service.list(status.data);

    return NextResponse.json(properties);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch moderation properties" },
      { status: 500 },
    );
  }
}

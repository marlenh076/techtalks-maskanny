import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, getCurrentUser } from "@/src/lib/supabase/auth";
import { HostRepository } from "@/src/features/users/repository/host.repository";
import { PropertyRepository } from "@/src/features/properties/repository/property.repository";
import { PropertyService } from "@/src/features/properties/service/property";

export async function GET(request: NextRequest) {
  try {
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

    const properties = await new PropertyService(
      new PropertyRepository(token),
    ).getByHostId(host.host_id);
    return NextResponse.json(properties);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch host properties" },
      { status: 500 },
    );
  }
}

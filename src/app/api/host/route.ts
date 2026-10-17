import { NextRequest, NextResponse } from "next/server";

import { getAccessToken, getCurrentUser } from "@/src/lib/supabase/auth";
import { HostRepository } from "@/src/features/users/repository/host.repository";
import { HostService } from "@/src/features/users/service/host";

export async function POST(request: NextRequest) {
  try {
    const token = getAccessToken(request);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hostRepository = new HostRepository(token);
    const hostService = new HostService(hostRepository);

    const existingHost = await hostService.getByUserId(user.id);

    if (existingHost) {
      return NextResponse.json({ error: "User is already a host" }, { status: 409 });
    }

    const host = await hostService.create(user.id);

    return NextResponse.json(host, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "Failed to become a host" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, getCurrentUser } from "@/src/lib/supabase/auth";
import { HostRepository } from "@/src/features/users/repository/host.repository";
import { hostPasswordSettingsSchema } from "@/src/features/users/validation/host-settings.schema";
import {
  changeHostPassword,
  HostSettingsPasswordError,
} from "@/src/features/users/service/host-settings-password";

const privateHeaders = { "Cache-Control": "private, no-store" };

export async function POST(request: NextRequest) {
  try {
    const token = getAccessToken(request);
    const authUser = token ? await getCurrentUser(request) : null;
    if (!token || !authUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: privateHeaders });
    const host = await new HostRepository(token).getByUserId(authUser.id);
    if (!host)
      return NextResponse.json(
        { error: "Host access required" },
        { status: 403, headers: privateHeaders },
      );
    if (!authUser.email)
      return NextResponse.json(
        { error: "Account email unavailable" },
        { status: 400, headers: privateHeaders },
      );

    const body = await request.json().catch(() => null);
    const parsed = hostPasswordSettingsSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid password details" },
        { status: 400, headers: privateHeaders },
      );
    await changeHostPassword(
      authUser.id,
      authUser.email,
      parsed.data.currentPassword,
      parsed.data.newPassword,
    );
    return NextResponse.json({ ok: true }, { headers: privateHeaders });
  } catch (error) {
    if (error instanceof HostSettingsPasswordError)
      return NextResponse.json(
        { error: error.message },
        { status: error.status, headers: privateHeaders },
      );
    return NextResponse.json(
      { error: "Password change is temporarily unavailable" },
      { status: 502, headers: privateHeaders },
    );
  }
}

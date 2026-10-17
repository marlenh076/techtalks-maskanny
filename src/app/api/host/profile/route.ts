import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, getCurrentUser } from "@/src/lib/supabase/auth";
import { HostRepository } from "@/src/features/users/repository/host.repository";
import { UserRepository } from "@/src/features/users/repository/user.repository";
import { hostProfileSettingsSchema } from "@/src/features/users/validation/host-settings.schema";

const privateHeaders = { "Cache-Control": "private, no-store" };

async function authorizeHost(request: NextRequest) {
  const token = getAccessToken(request);
  if (!token) return null;
  const authUser = await getCurrentUser(request);
  if (!authUser) return null;
  const host = await new HostRepository(token).getByUserId(authUser.id);
  return { token, authUser, isHost: Boolean(host) };
}

export async function GET(request: NextRequest) {
  try {
    const identity = await authorizeHost(request);
    if (!identity)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: privateHeaders });
    if (!identity.isHost)
      return NextResponse.json(
        { error: "Host access required" },
        { status: 403, headers: privateHeaders },
      );
    const profile = await new UserRepository(identity.token).getById(identity.authUser.id);
    if (!profile)
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404, headers: privateHeaders },
      );
    return NextResponse.json(
      {
        user_id: profile.user_id,
        firstname: profile.firstname,
        lastname: profile.lastname,
        email: identity.authUser.email ?? profile.email,
        phone: profile.phone,
      },
      { headers: privateHeaders },
    );
  } catch {
    return NextResponse.json(
      { error: "Could not load Host profile" },
      { status: 500, headers: privateHeaders },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const identity = await authorizeHost(request);
    if (!identity)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: privateHeaders });
    if (!identity.isHost)
      return NextResponse.json(
        { error: "Host access required" },
        { status: 403, headers: privateHeaders },
      );
    const body = await request.json().catch(() => null);
    const parsed = hostProfileSettingsSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid profile details" },
        { status: 400, headers: privateHeaders },
      );
    const user = await new UserRepository(identity.token).update(identity.authUser.id, parsed.data);
    return NextResponse.json(
      {
        user_id: user.user_id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: identity.authUser.email ?? user.email,
        phone: user.phone,
      },
      { headers: privateHeaders },
    );
  } catch {
    return NextResponse.json(
      { error: "Could not save Host profile" },
      { status: 500, headers: privateHeaders },
    );
  }
}

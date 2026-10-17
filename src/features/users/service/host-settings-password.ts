import { createClient } from "@supabase/supabase-js";

export class HostSettingsPasswordError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "HostSettingsPasswordError";
  }
}

/** Reauthenticates the user in an isolated Auth client before updating their password. */
export async function changeHostPassword(
  userId: string,
  email: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new HostSettingsPasswordError("Password service unavailable", 503);

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password: currentPassword,
  });
  if (error) {
    if (error?.status === 429)
      throw new HostSettingsPasswordError("Too many attempts; try again later", 429);
    throw new HostSettingsPasswordError("Current password could not be verified", 403);
  }
  if (!data.user || data.user.id !== userId) {
    if (data.user) await client.auth.signOut({ scope: "local" });
    throw new HostSettingsPasswordError("Current password could not be verified", 403);
  }

  try {
    const { error: updateError } = await client.auth.updateUser({ password: newPassword });
    if (updateError) {
      if (updateError.status === 429)
        throw new HostSettingsPasswordError("Too many attempts; try again later", 429);
      throw new HostSettingsPasswordError("Password change was rejected by Auth", 400);
    }
  } finally {
    await client.auth.signOut({ scope: "local" });
  }
}

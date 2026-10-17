import { createClient } from "@supabase/supabase-js";
import { AdminError } from "./errors";
import type { EmailChangeResult } from "../models/admin.model";

/** The server has a verified access token, not the browser's refresh-token session.
 * Use the same Auth /user endpoint as updateUser without creating a second session.
 * Auth confirmation rules and the existing sync_user_email trigger stay authoritative.
 */
export async function changeEmail(
  userId: string,
  accessToken: string,
  email: string,
): Promise<EmailChangeResult> {
  let response: Response;
  try {
    response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL!}/auth/v1/user`, {
      method: "PUT",
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
  } catch {
    throw new AdminError("Auth email update unavailable", 502);
  }
  if (!response.ok) {
    if (response.status === 429) throw new AdminError("Too many attempts; try again later", 429);
    if (response.status === 401 || response.status === 403)
      throw new AdminError(
        "Auth requires a valid session or additional verification",
        response.status,
      );
    throw new AdminError("Email change refused by Auth", response.status >= 500 ? 502 : 400);
  }
  let user: { id?: string; email?: string; new_email?: string };
  try {
    user = await response.json();
  } catch {
    throw new AdminError("Invalid Auth response", 502);
  }
  if (!user || user.id !== userId || typeof user.email !== "string")
    throw new AdminError("Invalid Auth response", 502);
  const confirmationRequired = user.email.toLowerCase() !== email.toLowerCase();
  if (confirmationRequired && user.new_email?.toLowerCase() !== email.toLowerCase()) {
    throw new AdminError("Auth did not confirm the email change request", 502);
  }
  return {
    email: user.email,
    requested_email: email,
    confirmation_required: confirmationRequired,
  };
}

/** Isolated Auth client: never place a user's session in the shared server singleton. */
export async function changePassword(
  userId: string,
  email: string,
  currentPassword: string,
  newPassword: string,
  nonce?: string,
) {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password: currentPassword,
  });
  if (error || !data.user || data.user.id !== userId) {
    if (error?.status === 429) throw new AdminError("Too many attempts; try again later", 429);
    throw new AdminError("Current password could not be verified", 403);
  }
  try {
    const result = await client.auth.updateUser({
      password: newPassword,
      ...(nonce ? { nonce } : {}),
    });
    if (result.error) {
      if (result.error.status === 429)
        throw new AdminError("Too many attempts; try again later", 429);
      throw new AdminError(
        "Password change refused by Auth; check password policy and reauthentication requirements",
        400,
      );
    }
    // Supabase Auth writes the authoritative password-change audit event. No password is logged here.
  } finally {
    await client.auth.signOut({ scope: "local" });
  }
}

export function avatarExtension(bytes: Uint8Array, mime: string): "png" | "jpg" | "webp" {
  const matches = (offset: number, values: number[]) =>
    values.every((value, i) => bytes[offset + i] === value);
  if (mime === "image/png" && matches(0, [137, 80, 78, 71, 13, 10, 26, 10])) return "png";
  if (mime === "image/jpeg" && matches(0, [255, 216, 255])) return "jpg";
  if (mime === "image/webp" && matches(0, [82, 73, 70, 70]) && matches(8, [87, 69, 66, 80]))
    return "webp";
  throw new AdminError("A PNG, JPEG or WebP image is required", 400);
}

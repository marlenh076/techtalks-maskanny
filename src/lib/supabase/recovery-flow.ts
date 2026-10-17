/** This URL marker identifies the request's purpose, never its validity. */
export function recoveryRedirectUrl(origin: string): string {
  const url = new URL("/auth/callback", origin);
  url.searchParams.set("flow", "recovery");
  return url.toString();
}

export function hasRecoveryHint(url: URL): boolean {
  return (
    url.searchParams.get("flow") === "recovery" ||
    url.searchParams.get("type") === "recovery" ||
    new URLSearchParams(url.hash.slice(1)).get("type") === "recovery"
  );
}

/** Only the type returned by a successful Supabase exchange authorizes recovery. */
export function exchangedCodePurpose(
  redirectType: string | null | undefined,
  recoveryHint: boolean,
): "recovery" | "confirmation" | "invalid-recovery" {
  if (redirectType === "recovery") return "recovery";
  return recoveryHint ? "invalid-recovery" : "confirmation";
}

export function validateResetPasswords(
  password: string,
  confirmation: string,
): {
  password?: string;
  confirmPassword?: string;
} {
  return {
    password: !password
      ? "Enter a new password."
      : password.length < 8
        ? "Use at least 8 characters."
        : undefined,
    confirmPassword: !confirmation
      ? "Confirm your new password."
      : password !== confirmation
        ? "Passwords do not match."
        : undefined,
  };
}

export type RecoveryGrant = { userId?: string; sessionId?: string; expiresAt?: number } | null;

export function hasValidRecoveryGrant(
  grant: RecoveryGrant,
  userId: string | undefined,
  sessionId: string | undefined,
  now = Date.now(),
): boolean {
  return Boolean(
    userId &&
    sessionId &&
    grant?.userId === userId &&
    grant.sessionId === sessionId &&
    typeof grant.expiresAt === "number" &&
    grant.expiresAt > now,
  );
}

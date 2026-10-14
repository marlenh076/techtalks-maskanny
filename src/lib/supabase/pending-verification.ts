import { safeReturnPath } from "./safe-return";

const STORAGE_KEY = "maskanny-pending-email-verification";
export const RESEND_COOLDOWN_MS = 60_000;
const PENDING_LIFETIME_MS = 24 * 60 * 60_000;

export type PendingVerification = {
  email: string;
  next: string | null;
  resendAfter: number;
  createdAt: number;
};

export function readPendingVerification(): PendingVerification | null {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null");
    if (!value || typeof value !== "object") return null;
    const pending = value as Partial<PendingVerification>;
    if (
      typeof pending.email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pending.email) ||
      typeof pending.createdAt !== "number" ||
      pending.createdAt > Date.now() ||
      Date.now() - pending.createdAt > PENDING_LIFETIME_MS
    ) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return {
      email: pending.email,
      next: safeReturnPath(pending.next),
      resendAfter: typeof pending.resendAfter === "number" ? pending.resendAfter : 0,
      createdAt: pending.createdAt,
    };
  } catch {
    return null;
  }
}

export function savePendingVerification(email: string, next: string | null) {
  const pending: PendingVerification = {
    email: email.trim(),
    next: safeReturnPath(next),
    resendAfter: Date.now() + RESEND_COOLDOWN_MS,
    createdAt: Date.now(),
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
  return pending;
}

export function startResendCooldown(pending: PendingVerification) {
  const updated = { ...pending, resendAfter: Date.now() + RESEND_COOLDOWN_MS };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Keep the current page's cooldown even if storage becomes unavailable.
  }
  return updated;
}

export function clearPendingVerification() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // A successful verification must still be allowed to navigate.
  }
}

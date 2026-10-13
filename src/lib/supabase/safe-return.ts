export function safeReturnPath(candidate: string | null | undefined): string | null {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//") || /[\\\u0000-\u001f]/.test(candidate)) {
    return null;
  }

  try {
    const parsed = new URL(candidate, "https://maskanny.invalid");
    if (parsed.origin !== "https://maskanny.invalid") return null;
    if (["/sign-in", "/sign-up", "/verify-email", "/forgot-password", "/reset-password", "/auth/callback"].includes(parsed.pathname)) return null;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

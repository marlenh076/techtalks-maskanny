import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/src/lib/database/types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Confirmation returns a session as part of Supabase's API response. Keep it
// isolated from the app's cookie-backed client so confirmation does not log in
// this browser or replace an existing user's session.
export function createConfirmationClient() {
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

// Older/default Supabase emails redirect with a PKCE code. The verifier lives
// in the signup browser's @supabase/ssr cookies, so an isolated exchange must
// read just those cookies. It may remove used verifier cookies, but never
// exposes or writes the application's session cookies to the isolated client.
export function createPkceConfirmationClient() {
  const sourceKey = `sb-${new URL(url).hostname.split(".")[0]}-auth-token`;
  const temporaryKey = `maskanny-confirmation-${crypto.randomUUID()}`;
  const isVerifier = (name: string) =>
    name.startsWith(`${sourceKey}-`) && name.includes("code-verifier");

  return createBrowserClient<Database>(url, key, {
    isSingleton: false,
    auth: {
      storageKey: temporaryKey,
      detectSessionInUrl: false,
      autoRefreshToken: false,
    },
    cookies: {
      getAll() {
        return document.cookie.split(";").flatMap((rawPart) => {
          const part = rawPart.trim();
          const separator = part.indexOf("=");
          if (separator < 0) return [];
          const name = part.slice(0, separator);
          if (!isVerifier(name)) return [];
          return [{
            name: `${temporaryKey}${name.slice(sourceKey.length)}`,
            value: decodeURIComponent(part.slice(separator + 1)),
          }];
        });
      },
      setAll(cookies) {
        for (const cookie of cookies) {
          const name = `${sourceKey}${cookie.name.slice(temporaryKey.length)}`;
          if (cookie.value === "" && isVerifier(name)) {
            document.cookie = `${name}=; Path=/; SameSite=Lax; Max-Age=0`;
          }
        }
      },
    },
  });
}

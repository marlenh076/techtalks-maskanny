import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import { Database } from "../database/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Keep the browser session in cookies so Server Components can verify it.
// Callback links are exchanged explicitly on /auth/callback.
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey, {
  auth: { detectSessionInUrl: false },
});

export function createAuthenticatedClient(accessToken: string) {
  return createClient<Database>(supabaseUrl, supabaseKey, {
    // This client uses one request's bearer token. It must never replace the
    // browser's cookie-backed Auth session when a server API uses it.
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

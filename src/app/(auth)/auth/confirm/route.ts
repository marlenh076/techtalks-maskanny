import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/src/lib/database/types";

const noStore = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  let body: { token_hash?: unknown; type?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ verified: false }, { status: 400, headers: noStore });
  }

  if (
    !body ||
    typeof body !== "object" ||
    typeof body.token_hash !== "string" ||
    body.token_hash.length < 1 ||
    body.token_hash.length > 512 ||
    (body.type !== "email" && body.type !== "signup")
  ) {
    return Response.json({ verified: false }, { status: 400, headers: noStore });
  }

  // Supabase returns a session with verifyOtp. This request-local client keeps
  // it in memory only; no authentication cookie or token reaches the browser.
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  );

  try {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: body.token_hash, type: body.type });
    if (error || !data.user?.email_confirmed_at) {
      return Response.json({ verified: false }, { status: 400, headers: noStore });
    }
    return Response.json({ verified: true }, { headers: noStore });
  } catch {
    return Response.json({ verified: false }, { status: 503, headers: noStore });
  }
}

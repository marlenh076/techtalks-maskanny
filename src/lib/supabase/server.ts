import { createClient } from "@supabase/supabase-js";
import { Database } from "../database/types";

export function createServerClient(request: Request) {
  const authHeader = request.headers.get("authorization");

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: {
        headers: {
          Authorization: authHeader ?? "",
        },
      },
    },
  );
}

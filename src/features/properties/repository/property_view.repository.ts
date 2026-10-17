import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/src/lib/database/types";

export async function recordPropertyView(propertyId: string, visitorKey: string): Promise<boolean> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("Property view tracking is not configured");
  const client = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.rpc("record_property_view", {
    p_property_id: propertyId,
    p_visitor_key: visitorKey,
  });
  if (error) throw new Error(error.message);
  return data;
}

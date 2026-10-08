import "server-only";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/src/lib/database/types";
import { User } from "@/src/features/users/models/user.model";

export type HostContact = Pick<User, "firstname" | "lastname" | "email" | "phone">;

/** Server-only, limited to the public contact fields for an approved listing. */
export class HostContactRepository {
  async getByHostId(hostId: string): Promise<HostContact | null> {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) throw new Error("Host contact service is not configured");

    const client = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data: host, error: hostError } = await client
      .from("host")
      .select("user_id")
      .eq("host_id", hostId)
      .maybeSingle();
    if (hostError) throw new Error(hostError.message);
    if (!host) return null;

    const { data: user, error: userError } = await client
      .from("user")
      .select("firstname,lastname,email,phone")
      .eq("user_id", host.user_id)
      .maybeSingle();
    if (userError) throw new Error(userError.message);
    return user;
  }
}

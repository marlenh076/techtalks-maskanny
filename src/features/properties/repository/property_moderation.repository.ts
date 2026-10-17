import { createAuthenticatedClient } from "@/src/lib/supabase/client";
import { databaseError } from "@/src/features/admin/service/errors";

export class PropertyModerationRepository {
  private readonly supabase;

  constructor(accessToken: string) {
    this.supabase = createAuthenticatedClient(accessToken);
  }

  async approve(propertyId: string, reason?: string): Promise<void> {
    const { error } = await this.supabase.rpc("moderate_property", {
      p_property_id: propertyId,
      p_decision: "approved",
      p_reason: reason,
    });

    if (error) {
      databaseError(error);
    }
  }

  async reject(propertyId: string, reason: string): Promise<void> {
    const { error } = await this.supabase.rpc("moderate_property", {
      p_property_id: propertyId,
      p_decision: "rejected",
      p_reason: reason,
    });

    if (error) {
      databaseError(error);
    }
  }
}

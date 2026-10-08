import { createAuthenticatedClient } from "@/src/lib/supabase/client";

import {
  ModerationPropertyDetails,
  ModerationPropertySummary,
  ModerationStatus,
} from "../models/property_moderation.model";

export class PropertyModerationReadRepository {
  private readonly supabase;

  constructor(accessToken: string) {
    this.supabase = createAuthenticatedClient(accessToken);
  }

  async list(status: ModerationStatus): Promise<ModerationPropertySummary[]> {
    const { data, error } = await this.supabase.rpc(
      "list_moderation_properties",
      { p_status: status },
    );

    if (error) throw new Error(error.message);
    if (!Array.isArray(data)) throw new Error("Invalid moderation list response");

    return data as unknown as ModerationPropertySummary[];
  }

  async getById(propertyId: string): Promise<ModerationPropertyDetails | null> {
    const { data, error } = await this.supabase.rpc(
      "get_moderation_property",
      { p_property_id: propertyId },
    );

    if (error) throw new Error(error.message);
    if (data === null) return null;
    if (typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Invalid moderation details response");
    }

    return data as unknown as ModerationPropertyDetails;
  }
}

import { createAuthenticatedClient } from "@/src/lib/supabase/client";

export class PropertyModerationError extends Error {
  constructor(
    message: string,
    readonly status: 403 | 404 | 409,
  ) {
    super(message);
  }
}

export class PropertyModerationRepository {
  private readonly supabase;

  constructor(accessToken: string) {
    this.supabase = createAuthenticatedClient(accessToken);
  }

  async approve(propertyId: string): Promise<void> {
    const { error } = await this.supabase.rpc("approve_property", {
      p_property_id: propertyId,
    });

    if (error) {
      this.throwModerationError(error.code);
    }
  }

  async reject(propertyId: string): Promise<void> {
    const { error } = await this.supabase.rpc("reject_property", {
      p_property_id: propertyId,
    });

    if (error) {
      this.throwModerationError(error.code);
    }
  }

  private throwModerationError(code: string): never {
    switch (code) {
      case "42501":
        throw new PropertyModerationError("Forbidden", 403);
      case "M4040":
        throw new PropertyModerationError("Property not found", 404);
      case "M4090":
        throw new PropertyModerationError("Property cannot be approved", 409);
      case "M4091":
        throw new PropertyModerationError("Pending boost required", 409);
      case "M4092":
        throw new PropertyModerationError("Boosting plan unavailable or invalid", 409);
      default:
        throw new Error("Property moderation failed");
    }
  }
}

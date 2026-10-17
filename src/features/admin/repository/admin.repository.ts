import { createAuthenticatedClient } from "@/src/lib/supabase/client";
import type { Json, Database } from "@/src/lib/database/types";
import { databaseError } from "../service/errors";
import type {
  Page,
  AdminProfile,
  AdminStatistics,
  AdminBoostQueue,
  AdminBoostRequest,
  AdminDirectoryEntry,
  AdminDirectoryDetail,
} from "../models/admin.model";

type Functions = Database["public"]["Functions"];
export class AdminRepository {
  readonly client;
  constructor(token: string) {
    this.client = createAuthenticatedClient(token);
  }

  async rpc<K extends keyof Functions>(
    name: K,
    args: Functions[K]["Args"],
  ): Promise<Functions[K]["Returns"]> {
    const { data, error } = await this.client.rpc(name, args);
    if (error) databaseError(error, String(name));
    return data as Functions[K]["Returns"];
  }
  async list<T>(kind: string, filters: Record<string, unknown>): Promise<Page<T>> {
    return (await this.rpc("admin_list", {
      p_kind: kind,
      p_filters: filters as Json,
    })) as unknown as Page<T>;
  }
  async directory(
    kind: "users" | "hosts",
    filters: Record<string, unknown>,
  ): Promise<Page<AdminDirectoryEntry>> {
    return (await this.rpc("admin_directory_list", {
      p_kind: kind,
      p_filters: filters as Json,
    })) as unknown as Page<AdminDirectoryEntry>;
  }
  async directoryDetail(kind: "users" | "hosts", id: string): Promise<AdminDirectoryDetail | null> {
    return (await this.rpc("admin_directory_detail", {
      p_kind: kind,
      p_id: id,
    })) as unknown as AdminDirectoryDetail | null;
  }
  async boostQueue(filters: Record<string, unknown>): Promise<AdminBoostQueue> {
    return (await this.rpc("admin_boost_queue", {
      p_filters: filters as Json,
    })) as unknown as AdminBoostQueue;
  }
  async boostDetail(id: string): Promise<AdminBoostRequest | null> {
    return (await this.rpc("admin_boost_detail", {
      p_id: id,
    })) as unknown as AdminBoostRequest | null;
  }
  async signedBoostReceipt(path: string): Promise<string | null> {
    const { data, error } = await this.client.storage
      .from("boost-payment-receipts")
      .createSignedUrl(path, 300);
    return error ? null : (data?.signedUrl ?? null);
  }
  async decideBoostPayment(
    id: string,
    input: {
      payment_id: string | null;
      reference: string | null;
      decision: "approved" | "rejected";
      whish_confirmed: boolean;
      reason?: string;
    },
  ) {
    return this.rpc("admin_decide_boost_payment", {
      p_boost_id: id,
      p_payment_id: input.payment_id,
      p_reference: input.reference,
      p_decision: input.decision,
      p_whish_confirmed: input.whish_confirmed,
      p_reason: input.reason ?? null,
    });
  }
  async statistics(from: string, to: string): Promise<AdminStatistics> {
    return (await this.rpc("admin_statistics", {
      p_from: from,
      p_to: to,
    })) as unknown as AdminStatistics;
  }
  async profile(): Promise<AdminProfile> {
    return (await this.rpc("admin_get_profile", {})) as unknown as AdminProfile;
  }
  async updateProfile(changes: Record<string, unknown>): Promise<AdminProfile> {
    return (await this.rpc("admin_update_profile", {
      p_changes: changes as Json,
    })) as unknown as AdminProfile;
  }
}

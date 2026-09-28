import { supabase, createAuthenticatedClient } from "@/src/lib/supabase/client";

import { Host } from "../models/host.model";
import { IHostRepository } from "./IHost.repository";

export class HostRepository implements IHostRepository {
  private supabase;

  constructor(accessToken?: string) {
    this.supabase = accessToken
      ? createAuthenticatedClient(accessToken)
      : supabase;
  }

  async getByUserId(userId: string): Promise<Host | null> {
    const { data, error } = await this.supabase
      .from("host")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async create(userId: string): Promise<Host> {
    const { data, error } = await this.supabase
      .from("host")
      .insert({
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}

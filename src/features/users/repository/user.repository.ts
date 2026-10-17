import { supabase, createAuthenticatedClient } from "@/src/lib/supabase/client";

import { User, UserProfileUpdate } from "../models/user.model";
import { IUserRepository } from "./IUser.repository";

export class UserRepository implements IUserRepository {
  private supabase;

  constructor(accessToken?: string) {
    this.supabase = accessToken ? createAuthenticatedClient(accessToken) : supabase;
  }

  async getById(id: string): Promise<User | null> {
    const { data: user, error } = await this.supabase
      .from("user")
      .select("*")
      .eq("user_id", id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return user;
  }

  async getAll(): Promise<User[]> {
    const { data: users, error } = await this.supabase.from("user").select("*");

    if (error) {
      throw new Error(error.message);
    }

    return users;
  }

  async update(id: string, data: UserProfileUpdate): Promise<User> {
    const { data: user, error } = await this.supabase
      .from("user")
      .update(data)
      .eq("user_id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return user;
  }
}

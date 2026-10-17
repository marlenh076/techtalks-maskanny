import { supabase, createAuthenticatedClient } from "../../../lib/supabase/client";
import { Media } from "../models/media.model";
import { IMediaRepository } from "./IMedia.repository";

export class MediaUnavailableError extends Error {
  constructor() {
    super("Media not found or access denied");
  }
}

export class MediaLimitError extends Error {}

export class MediaRepository implements IMediaRepository {
  private supabase;

  constructor(accessToken?: string) {
    this.supabase = accessToken ? createAuthenticatedClient(accessToken) : supabase;
  }

  async create(
    data: Omit<Media, "media_id" | "created_at"> & { media_id?: string },
  ): Promise<Media> {
    const { data: media, error } = await this.supabase.from("media").insert(data).select().single();

    if (error) {
      if (error.code === "M4093") throw new MediaLimitError(error.message);
      throw new Error(error.message);
    }

    return media;
  }

  async update(id: string, data: Partial<Media>): Promise<Media> {
    const { data: media, error } = await this.supabase
      .from("media")
      .update(data)
      .eq("media_id", id)
      .select()
      .maybeSingle();

    if (error) {
      if (error.code === "M4093") throw new MediaLimitError(error.message);
      throw new Error(error.message);
    }

    if (!media) {
      throw new MediaUnavailableError();
    }

    return media;
  }

  async getById(id: string): Promise<Media | null> {
    const { data: media, error } = await this.supabase
      .from("media")
      .select("*")
      .eq("media_id", id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return media;
  }

  async getAll(): Promise<Media[]> {
    const { data: media, error } = await this.supabase.from("media").select("*");

    if (error) {
      throw new Error(error.message);
    }

    return media;
  }

  async getByPropertyId(propertyId: string): Promise<Media[]> {
    const { data: media, error } = await this.supabase
      .from("media")
      .select("*")
      .eq("property_id", propertyId)
      .order("sort_order", { ascending: true })
      .order("media_id", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return media;
  }

  async getImagesByPropertyIds(
    propertyIds: string[],
  ): Promise<Pick<Media, "property_id" | "url">[]> {
    if (propertyIds.length === 0) return [];

    const { data, error } = await this.supabase
      .from("media")
      .select("property_id,url")
      .in("property_id", propertyIds)
      .eq("type", "image")
      .order("sort_order", { ascending: true })
      .order("media_id", { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { data: media, error } = await this.supabase
      .from("media")
      .delete()
      .eq("media_id", id)
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!media) {
      throw new MediaUnavailableError();
    }
  }
}

import { supabase } from "../../../lib/supabase/client";
import { Media } from "../models/media.model";
import { IMediaRepository } from "./IMedia.repository";

export class MediaRepository implements IMediaRepository {
  async create(data: Omit<Media, "media_id" | "created_at">): Promise<Media> {
    const { data: media, error } = await supabase
      .from("media")
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return media;
  }

  async update(id: string, data: Partial<Media>): Promise<Media> {
    const { data: media, error } = await supabase
      .from("media")
      .update(data)
      .eq("media_id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return media;
  }

  async getById(id: string): Promise<Media | null> {
    const { data: media, error } = await supabase
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
    const { data: media, error } = await supabase.from("media").select("*");

    if (error) {
      throw new Error(error.message);
    }

    return media;
  }

  async getByPropertyId(propertyId: string): Promise<Media[]> {
    const { data: media, error } = await supabase
      .from("media")
      .select("*")
      .eq("property_id", propertyId);

    if (error) {
      throw new Error(error.message);
    }

    return media;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("media").delete().eq("media_id", id);

    if (error) {
      throw new Error(error.message);
    }
  }
}

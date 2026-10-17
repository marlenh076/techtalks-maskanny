import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { MediaLimitError, MediaService } from "@/src/features/properties/service/media";
import {
  MediaRepository,
  MediaUnavailableError,
} from "@/src/features/properties/repository/media.repository";
import { PropertyRepository } from "@/src/features/properties/repository/property.repository";
import { HostRepository } from "@/src/features/users/repository/host.repository";

import { StorageService } from "@/src/lib/supabase/storage";
import { getAccessToken, getCurrentUser } from "@/src/lib/supabase/auth";
import {
  MAX_MEDIA_FILE_SIZE,
  PROPERTY_MEDIA_TYPES,
} from "@/src/features/properties/validation/media-limits";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!z.uuid().safeParse(id).success) {
      return NextResponse.json({ error: "Invalid media ID" }, { status: 400 });
    }

    let token: string | null = null;
    if (request.headers.has("authorization")) {
      token = getAccessToken(request);
      if (!token || !(await getCurrentUser(request))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const media = await new MediaService(new MediaRepository(token ?? undefined)).getById(id);

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    return NextResponse.json(media);
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!z.uuid().safeParse(id).success) {
      return NextResponse.json({ error: "Invalid media ID" }, { status: 400 });
    }

    const token = getAccessToken(request);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mediaService = new MediaService(new MediaRepository(token));

    const existingMedia = await mediaService.getById(id);

    if (!existingMedia) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    const property = await new PropertyRepository(token).getById(existingMedia.property_id);

    if (!property) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    const host = await new HostRepository(token).getByUserId(user.id);

    if (!host || property.host_id !== host.host_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (property.archived_at || property.approval_status === "rejected") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData().catch(() => null);

    if (!formData) {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!PROPERTY_MEDIA_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    if (file.size > MAX_MEDIA_FILE_SIZE) {
      return NextResponse.json({ error: "File size must not exceed 50 MB" }, { status: 400 });
    }

    const fileExtension = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExtension}`;
    const newFilePath = `${existingMedia.property_id}/${fileName}`;

    const newType = file.type.startsWith("image/") ? "image" : "video";
    await mediaService.assertWithinLimit(existingMedia.property_id, newType, id);

    const storageService = new StorageService();

    await storageService.upload(token, "properties-media", newFilePath, file);

    const newUrl = storageService.getPublicUrl("properties-media", newFilePath);

    let updatedMedia;

    try {
      updatedMedia = await mediaService.update(id, {
        url: newUrl,
        type: newType,
      });
    } catch (error) {
      await storageService.delete(token, "properties-media", newFilePath);

      throw error;
    }

    const oldUrl = new URL(existingMedia.url);

    const oldPath = oldUrl.pathname.split("/storage/v1/object/public/properties-media/")[1];

    if (oldPath) {
      try {
        await storageService.delete(token, "properties-media", oldPath);
      } catch (error) {
        console.error("Failed to delete old media file:", error);
      }
    }

    return NextResponse.json(updatedMedia);
  } catch (error) {
    if (error instanceof MediaUnavailableError) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    if (error instanceof MediaLimitError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    console.error(error);

    return NextResponse.json({ error: "Failed to replace media" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!z.uuid().safeParse(id).success) {
      return NextResponse.json({ error: "Invalid media ID" }, { status: 400 });
    }

    const token = getAccessToken(request);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await getCurrentUser(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mediaService = new MediaService(new MediaRepository(token));

    const existingMedia = await mediaService.getById(id);

    if (!existingMedia) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    const oldUrl = new URL(existingMedia.url);

    const oldPath = oldUrl.pathname.split("/storage/v1/object/public/properties-media/")[1];

    if (!oldPath) {
      return NextResponse.json({ error: "Invalid media URL" }, { status: 400 });
    }

    const storageService = new StorageService();

    await mediaService.delete(id);

    await storageService.delete(token, "properties-media", oldPath);

    return NextResponse.json({
      message: "Media deleted successfully",
    });
  } catch (error) {
    if (error instanceof MediaUnavailableError) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    console.error(error);

    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}

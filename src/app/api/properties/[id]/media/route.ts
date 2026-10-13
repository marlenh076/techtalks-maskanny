import { NextRequest, NextResponse } from "next/server";

import { MediaLimitError, MediaService } from "@/src/features/properties/service/media";
import { MediaRepository } from "@/src/features/properties/repository/media.repository";
import { PropertyRepository } from "@/src/features/properties/repository/property.repository";
import { HostRepository } from "@/src/features/users/repository/host.repository";
import { StorageService } from "@/src/lib/supabase/storage";

import { getAccessToken, getCurrentUser } from "@/src/lib/supabase/auth";
import { z } from "zod";

async function cleanupUploadedFile(
  storageService: StorageService,
  token: string,
  filePath: string,
) {
  try {
    await storageService.delete(token, "properties-media", filePath);
  } catch (error) {
    console.error("Failed to clean up uploaded media file:", error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!z.uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: "Invalid property ID" },
        { status: 400 },
      );
    }

    let token: string | null = null;
    if (request.headers.has("authorization")) {
      token = getAccessToken(request);
      if (!token || !(await getCurrentUser(request))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const property = await new PropertyRepository(token ?? undefined).getById(id);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const media = await new MediaService(
      new MediaRepository(token ?? undefined),
    ).getByPropertyId(id);

    return NextResponse.json(media);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch property media" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let uploadedFilePath: string | null = null;
  let token: string | null = null;
  let storageService: StorageService | null = null;

  try {
    const { id } = await params;

    if (!z.uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: "Invalid property ID" },
        { status: 400 },
      );
    }

    token = getAccessToken(request);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const property = await new PropertyRepository(token).getById(id);

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const host = await new HostRepository(token).getByUserId(user.id);

    if (!host || property.host_id !== host.host_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (property.approval_status === "rejected") {
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

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 },
      );
    }

    const maxFileSize = 50 * 1024 * 1024;

    if (file.size > maxFileSize) {
      return NextResponse.json(
        { error: "File size must not exceed 50 MB" },
        { status: 400 },
      );
    }

    const fileExtension = file.name.split(".").pop();

    const fileName = `${crypto.randomUUID()}.${fileExtension}`;

    const filePath = `${id}/${fileName}`;
    const type = file.type.startsWith("image/") ? "image" : "video";
    const mediaService = new MediaService(new MediaRepository(token));
    await mediaService.assertWithinLimit(id, type);

    storageService = new StorageService();

    await storageService.upload(token, "properties-media", filePath, file);

    // From this point onward, cleanup is required if something fails.
    uploadedFilePath = filePath;

    const url = storageService.getPublicUrl("properties-media", filePath);

    const media = await mediaService.create({
      property_id: id,
      url,
      type,
    });

    // DB creation succeeded, so this file should no longer be rolled back.
    uploadedFilePath = null;

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    if (uploadedFilePath && token && storageService) {
      await cleanupUploadedFile(storageService, token, uploadedFilePath);
    }

    if (error instanceof MediaLimitError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    console.error(error);

    return NextResponse.json(
      { error: "Failed to create media" },
      { status: 500 },
    );
  }
}

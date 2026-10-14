import { NextRequest, NextResponse } from "next/server";

import { MediaLimitError, MediaService } from "@/src/features/properties/service/media";
import { MediaRepository } from "@/src/features/properties/repository/media.repository";
import { PropertyRepository } from "@/src/features/properties/repository/property.repository";
import { HostRepository } from "@/src/features/users/repository/host.repository";
import { StorageService } from "@/src/lib/supabase/storage";

import { getAccessToken, getCurrentUser } from "@/src/lib/supabase/auth";
import { z } from "zod";
import { MAX_MEDIA_FILE_SIZE, MAX_PROPERTY_IMAGE_FILE_SIZE, PROPERTY_MEDIA_TYPES } from "@/src/features/properties/validation/media-limits";

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

    if (!PROPERTY_MEDIA_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 },
      );
    }

    const type = file.type.startsWith("image/") ? "image" : "video";
    const maxSize = type === "image" ? MAX_PROPERTY_IMAGE_FILE_SIZE : MAX_MEDIA_FILE_SIZE;
    if (file.size === 0 || file.size > maxSize) {
      return NextResponse.json(
        { error: type === "image"
          ? "Each photo must be nonempty and 5 MB or smaller. Choose a smaller image or reduce its resolution."
          : "File must be nonempty and must not exceed 50 MB" },
        { status: 400 },
      );
    }

    const mediaService = new MediaService(new MediaRepository(token));
    const requestId = request.headers.get("Idempotency-Key");
    if (requestId && !z.uuid().safeParse(requestId).success) {
      return NextResponse.json({ error: "Invalid idempotency key" }, { status: 400 });
    }
    const orderInput = formData.get("sort_order");
    const order = z.coerce.number().int().min(0).max(type === "image" ? 5 : 6)
      .safeParse(orderInput ?? 0);
    if (!order.success) {
      return NextResponse.json({ error: "Invalid photo order" }, { status: 400 });
    }
    // Filename extensions come from the validated MIME type, never user paths.
    const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
    const filePath = `${id}/${requestId ?? crypto.randomUUID()}.${extension}`;
    storageService = new StorageService();
    const url = storageService.getPublicUrl("properties-media", filePath);
    if (requestId) {
      const existing = await mediaService.getById(requestId);
      if (existing?.property_id === id && existing.url === url) return NextResponse.json(existing);
      if (existing) return NextResponse.json({ error: "Upload key unavailable" }, { status: 409 });
    }
    try {
      // Include the limit read in retry reconciliation: another same-key
      // request may have filled the sixth slot since the first lookup.
      await mediaService.assertWithinLimit(id, type);
      // A retry can replace its own deterministic path if the storage response
      // was lost before the media row was saved. Normal uploads remain inserts.
      await storageService.upload(token, "properties-media", filePath, file, Boolean(requestId));
      // A keyed path may belong to another in-flight retry or a committed row
      // whose acknowledgement was lost. Keep it available for the same-key
      // retry; deleting it here could leave a successful media row without a
      // file. Legacy uploads retain the existing rollback cleanup behavior.
      uploadedFilePath = requestId ? null : filePath;
      const media = await mediaService.create({
        property_id: id, url, type, sort_order: order.data,
        ...(requestId ? { media_id: requestId } : {}),
      });
      uploadedFilePath = null;
      return NextResponse.json(media, { status: 201 });
    } catch (error) {
      if (requestId) {
        const existing = await mediaService.getById(requestId);
        if (existing?.property_id === id && existing.url === url) {
          // Another request already completed; its file must not be removed.
          uploadedFilePath = null;
          return NextResponse.json(existing);
        }
      }
      throw error;
    }
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

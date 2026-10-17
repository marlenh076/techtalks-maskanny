import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { PropertyService } from "@/src/features/properties/service/property";
import {
  PropertyRepository,
  PropertyUnavailableError,
} from "@/src/features/properties/repository/property.repository";
import { propertyUpdateSchema } from "@/src/features/properties/validation/property.schema";
import { getAccessToken, getCurrentUser } from "@/src/lib/supabase/auth";
import { StorageService } from "@/src/lib/supabase/storage";
import { HostRepository } from "@/src/features/users/repository/host.repository";

const propertyRepository = new PropertyRepository();
const propertyService = new PropertyService(propertyRepository);

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!z.uuid().safeParse(id).success) {
      return NextResponse.json({ error: "Invalid property ID" }, { status: 400 });
    }

    const property = await propertyService.getById(id);

    if (!property || property.approval_status !== "approved") {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "Failed to fetch property" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!z.uuid().safeParse(id).success) {
      return NextResponse.json({ error: "Invalid property ID" }, { status: 400 });
    }

    const token = getAccessToken(request);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await getCurrentUser(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json().catch(() => null);

    if (data === null) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const propertyRepository = new PropertyRepository(token);
    const propertyService = new PropertyService(propertyRepository);

    const result = propertyUpdateSchema.safeParse(data);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten(),
        },
        { status: 400 },
      );
    }

    const property = await propertyService.update(id, result.data);

    return NextResponse.json(property);
  } catch (error) {
    if (error instanceof PropertyUnavailableError) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    console.error(error);

    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!z.uuid().safeParse(id).success) {
      return NextResponse.json({ error: "Invalid property ID" }, { status: 400 });
    }

    const token = getAccessToken(request);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const propertyRepository = new PropertyRepository(token);
    const propertyService = new PropertyService(propertyRepository);

    const property = await propertyService.getById(id);

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const host = await new HostRepository(token).getByUserId(user.id);

    if (!host || property.host_id !== host.host_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // The archive is the authoritative database operation. Never remove public
    // objects until its transaction has committed successfully.
    await propertyService.delete(id);

    let mediaCleanupPending = false;
    try {
      await new StorageService().deleteFolder(token, "properties-media", id);
    } catch (error) {
      // The archived row is already safe and hidden. A repeated DELETE can retry
      // this idempotent folder cleanup without touching financial history.
      mediaCleanupPending = true;
      console.error("Archived property photo cleanup is pending:", error);
    }

    return NextResponse.json(
      {
        message: "Property archived successfully",
        archived: true,
        media_cleanup_pending: mediaCleanupPending,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof PropertyUnavailableError) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    console.error(error);

    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 });
  }
}

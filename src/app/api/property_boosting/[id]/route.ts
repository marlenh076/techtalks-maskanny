import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { PropertyBoostingService } from "@/src/features/boosting/service/property_boosting";
import { PropertyBoostingRepository } from "@/src/features/boosting/repository/property_boosting.repository";
import { getAccessToken, getCurrentUser } from "@/src/lib/supabase/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!z.uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: "Invalid property boosting ID" },
        { status: 400 },
      );
    }

    const token = getAccessToken(request);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await getCurrentUser(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const propertyBoostingRepository = new PropertyBoostingRepository(token);

    const propertyBoostingService = new PropertyBoostingService(
      propertyBoostingRepository,
    );

    const propertyBoosting = await propertyBoostingService.getById(id);

    if (!propertyBoosting) {
      return NextResponse.json(
        { error: "Property boosting not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(propertyBoosting);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch property boosting" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!z.uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: "Invalid property boosting ID" },
        { status: 400 },
      );
    }

    const token = getAccessToken(request);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await getCurrentUser(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const propertyBoostingRepository = new PropertyBoostingRepository(token);

    const propertyBoostingService = new PropertyBoostingService(
      propertyBoostingRepository,
    );

    const existingPropertyBoosting = await propertyBoostingService.getById(id);

    if (!existingPropertyBoosting) {
      return NextResponse.json(
        { error: "Property boosting not found" },
        { status: 404 },
      );
    }

    await propertyBoostingService.delete(id);

    return NextResponse.json({
      message: "Property boosting deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to delete property boosting" },
      { status: 500 },
    );
  }
}

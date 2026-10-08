import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { PropertyBoostingService } from "@/src/features/boosting/service/property_boosting";
import {
  PropertyBoostingRequestError,
  PropertyBoostingRepository,
} from "@/src/features/boosting/repository/property_boosting.repository";
import { propertyBoostingSchema } from "@/src/features/boosting/validation/property_boosting.schema";
import { HostRepository } from "@/src/features/users/repository/host.repository";
import { getAccessToken, getCurrentUser } from "@/src/lib/supabase/auth";
import { PropertyRepository } from "@/src/features/properties/repository/property.repository";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => undefined);

    if (body === undefined) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const token = getAccessToken(request);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const host = await new HostRepository(token).getByUserId(user.id);

    if (!host) {
      return NextResponse.json(
        { error: "Host access required" },
        { status: 403 },
      );
    }

    const result = propertyBoostingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid property boosting data",
          details: z.treeifyError(result.error),
        },
        { status: 400 },
      );
    }

    const propertyRepository = new PropertyRepository(token);

    const property = await propertyRepository.getById(result.data.property_id);

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    if (property.host_id !== host.host_id) {
      return NextResponse.json(
        { error: "You do not own this property" },
        { status: 403 },
      );
    }

    if (property.approval_status === "rejected") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const propertyBoostingRepository = new PropertyBoostingRepository(token);

    const propertyBoostingService = new PropertyBoostingService(
      propertyBoostingRepository,
    );

    const propertyBoosting = await propertyBoostingService.create(result.data);

    return NextResponse.json(propertyBoosting, { status: 201 });
  } catch (error) {
    if (error instanceof PropertyBoostingRequestError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error(error);

    return NextResponse.json(
      { error: "Failed to create property boosting" },
      { status: 500 },
    );
  }
}

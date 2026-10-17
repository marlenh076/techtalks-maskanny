import { NextResponse, NextRequest } from "next/server";
import { PropertyService } from "../../../features/properties/service/property";
import { PropertyRepository } from "../../../features/properties/repository/property.repository";
import {
  propertySchema,
  propertyFiltersSchema,
} from "@/src/features/properties/validation/property.schema";
import { HostRepository } from "@/src/features/users/repository/host.repository";
import { getAccessToken, getCurrentUser } from "@/src/lib/supabase/auth";
import { MediaRepository } from "@/src/features/properties/repository/media.repository";
import { PropertyDiscoveryService } from "@/src/features/properties/service/discovery";
import { z } from "zod";

const propertyRepository = new PropertyRepository();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const result = propertyFiltersSchema.safeParse(Object.fromEntries(searchParams.entries()));

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 });
    }

    const properties = await new PropertyDiscoveryService(
      propertyRepository,
      new MediaRepository(),
    ).search(result.data);

    return NextResponse.json(properties);
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json({ error: "Host access required" }, { status: 403 });
    }

    const data = await request.json().catch(() => undefined);

    if (data === undefined) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const propertyRepository = new PropertyRepository(token);
    const propertyService = new PropertyService(propertyRepository);

    const result = propertySchema.safeParse(data);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 });
    }

    // A stable request UUID uses the existing primary key to make retries safe,
    // including when creation succeeds but the response is lost. Never accept
    // ownership or moderation fields from the request body.
    const requestId = request.headers.get("Idempotency-Key");
    if (requestId && !z.uuid().safeParse(requestId).success) {
      return NextResponse.json({ error: "Invalid idempotency key" }, { status: 400 });
    }
    if (requestId) {
      const existing = await propertyRepository.getById(requestId);
      if (existing?.host_id === host.host_id) return NextResponse.json(existing);
      if (existing) return NextResponse.json({ error: "Request key unavailable" }, { status: 409 });
    }

    let property;
    try {
      property = await propertyService.create({
        ...result.data,
        host_id: host.host_id,
        ...(requestId ? { property_id: requestId } : {}),
      });
    } catch (error) {
      // Concurrent retries may both pass the read; the unique PK still wins.
      if (requestId) {
        const existing = await propertyRepository.getById(requestId);
        if (existing?.host_id === host.host_id) return NextResponse.json(existing);
      }
      throw error;
    }

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "Failed to create property" }, { status: 500 });
  }
}

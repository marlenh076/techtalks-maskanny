import { NextResponse, NextRequest } from "next/server";
import { PropertyService } from "../../../features/properties/service/property";
import { PropertyRepository } from "../../../features/properties/repository/property.repository";
import {
  propertySchema,
  propertyFiltersSchema,
} from "@/src/features/properties/validation/property.schema";
import { HostRepository } from "@/src/features/users/repository/host.repository";
import { getAccessToken, getCurrentUser } from "@/src/lib/supabase/auth";

const propertyRepository = new PropertyRepository();
const propertyService = new PropertyService(propertyRepository);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const result = propertyFiltersSchema.safeParse(
      Object.fromEntries(searchParams.entries()),
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 });
    }

    const properties = await propertyService.search(result.data);

    return NextResponse.json(properties);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 },
    );
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
      return NextResponse.json(
        { error: "Host access required" },
        { status: 403 },
      );
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

    const property = await propertyService.create({
      ...result.data,
      host_id: host.host_id,
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 },
    );
  }
}

import { NextResponse, NextRequest } from "next/server";
import { PropertyService } from "../../../features/property/service/property";
import { PropertyRepository } from "../../../features/property/repository/property.repository";
import {
  propertySchema,
  propertyFiltersSchema,
} from "@/src/features/property/validation/property.schema";

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
    const data = await request.json();

    const result = propertySchema.safeParse(data);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 });
    }

    const property = await propertyService.create(result.data);

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 },
    );
  }
}

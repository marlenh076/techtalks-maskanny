import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { PropertyBoostingService } from "@/src/features/boosting/service/property_boosting";
import { PropertyBoostingRepository } from "@/src/features/boosting/repository/property_boosting.repository";
import { propertyBoostingSchema } from "@/src/features/boosting/validation/property_boosting.schema";

const propertyBoostingRepository = new PropertyBoostingRepository();
const propertyBoostingService = new PropertyBoostingService(
  propertyBoostingRepository,
);

export async function GET() {
  try {
    const propertyBoosting = await propertyBoostingService.getAll();

    return NextResponse.json(propertyBoosting);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch property boosting" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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

    const propertyBoosting = await propertyBoostingService.create(result.data);

    return NextResponse.json(propertyBoosting, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create property boosting" },
      { status: 500 },
    );
  }
}

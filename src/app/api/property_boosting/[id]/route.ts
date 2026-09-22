import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { PropertyBoostingService } from "@/src/features/boosting/service/property_boosting";
import { PropertyBoostingRepository } from "@/src/features/boosting/repository/property_boosting.repository";
import { propertyBoostingUpdateSchema } from "@/src/features/boosting/validation/property_boosting.schema";

const propertyBoostingRepository = new PropertyBoostingRepository();

const propertyBoostingService = new PropertyBoostingService(
  propertyBoostingRepository,
);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const result = propertyBoostingUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid property boosting data",
          details: z.treeifyError(result.error),
        },
        { status: 400 },
      );
    }

    const existingPropertyBoosting = await propertyBoostingService.getById(id);

    if (!existingPropertyBoosting) {
      return NextResponse.json(
        { error: "Property boosting not found" },
        { status: 404 },
      );
    }

    const propertyBoosting = await propertyBoostingService.update(
      id,
      result.data,
    );

    return NextResponse.json(propertyBoosting);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update property boosting" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

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

import { NextResponse } from "next/server";
import { PropertyBoostingService } from "@/src/features/boosting/service/property_boosting";
import { PropertyBoostingRepository } from "@/src/features/boosting/repository/property_boosting.repository";

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

    const propertyBoosting = await propertyBoostingService.getByPropertyId(id);

    if (!propertyBoosting) {
      return NextResponse.json(
        { error: "No boosting found for this property" },
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

import { NextRequest, NextResponse } from "next/server";
import { PropertyUniversityService } from "@/src/features/properties/service/property_universities";
import { PropertyUniversityRepository } from "@/src/features/properties/repository/property_universities.repository";
import z from "zod";

const propertyUniversityRepository = new PropertyUniversityRepository();
const propertyUniversityService = new PropertyUniversityService(
  propertyUniversityRepository,
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!z.uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: "Invalid university ID" },
        { status: 400 },
      );
    }

    const properties =
      await propertyUniversityService.getPropertiesByUniversityId(id);

    return NextResponse.json(properties);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch properties for university" },
      { status: 500 },
    );
  }
}

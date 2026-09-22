import { NextRequest, NextResponse } from "next/server";
import { PropertyService } from "@/src/features/properties/service/property";
import { PropertyRepository } from "@/src/features/properties/repository/property.repository";

const propertyRepository = new PropertyRepository();
const propertyService = new PropertyService(propertyRepository);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const property = await propertyService.getById(id);

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch property" },
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
    const data = await request.json();

    const property = await propertyService.update(id, data);

    return NextResponse.json(property);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update property" },
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

    await propertyService.delete(id);

    return NextResponse.json(
      { message: "Property deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to delete property" },
      { status: 500 },
    );
  }
}

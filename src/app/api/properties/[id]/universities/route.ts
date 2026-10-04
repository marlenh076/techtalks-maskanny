import { NextRequest, NextResponse } from "next/server";
import { PropertyUniversityService } from "@/src/features/properties/service/property_universities";
import { PropertyUniversityRepository } from "@/src/features/properties/repository/property_universities.repository";
import { PropertyRepository } from "@/src/features/properties/repository/property.repository";
import { getAccessToken, getCurrentUser } from "@/src/lib/supabase/auth";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!z.uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: "Invalid property ID" },
        { status: 400 },
      );
    }

    let token: string | null = null;
    if (request.headers.has("authorization")) {
      token = getAccessToken(request);
      if (!token || !(await getCurrentUser(request))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const property = await new PropertyRepository(token ?? undefined).getById(id);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const universities = await new PropertyUniversityService(
      new PropertyUniversityRepository(token ?? undefined),
    ).getUniversitiesByPropertyId(id);

    return NextResponse.json(universities);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch universities for property" },
      { status: 500 },
    );
  }
}

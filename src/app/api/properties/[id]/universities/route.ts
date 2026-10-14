import { NextRequest, NextResponse } from "next/server";
import { InvalidUniversitySelectionError, PropertyUniversityService } from "@/src/features/properties/service/property_universities";
import { PropertyUniversityRepository } from "@/src/features/properties/repository/property_universities.repository";
import { PropertyRepository } from "@/src/features/properties/repository/property.repository";
import { getAccessToken, getCurrentUser } from "@/src/lib/supabase/auth";
import { z } from "zod";
import { HostRepository } from "@/src/features/users/repository/host.repository";
import { UniversityRepository } from "@/src/features/universities/repository/university.repository";
import { UniversityService } from "@/src/features/universities/service/university";
import { propertyUniversitiesSchema } from "@/src/features/properties/validation/property-universities.schema";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!z.uuid().safeParse(id).success)
      return NextResponse.json({ error: "Invalid property ID" }, { status: 400 });
    const token = getAccessToken(request);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const host = await new HostRepository(token).getByUserId(user.id);
    if (!host) return NextResponse.json({ error: "Host access required" }, { status: 403 });
    const property = await new PropertyRepository(token).getById(id);
    if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });
    if (property.host_id !== host.host_id)
      return NextResponse.json({ error: "You can only associate universities with your own property" }, { status: 403 });

    const result = propertyUniversitiesSchema.safeParse(await request.json().catch(() => undefined));
    if (!result.success)
      return NextResponse.json({ error: result.error.issues }, { status: 400 });

    await new PropertyUniversityService(new PropertyUniversityRepository(token)).associate(
      id, result.data.university_ids, new UniversityService(new UniversityRepository()),
    );
    return NextResponse.json({ university_ids: result.data.university_ids });
  } catch (error) {
    if (error instanceof InvalidUniversitySelectionError)
      return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Failed to save property universities", error);
    return NextResponse.json({ error: "Could not save selected universities. Retry to finish your submission." }, { status: 500 });
  }
}

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

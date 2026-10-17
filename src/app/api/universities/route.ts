import { NextRequest, NextResponse } from "next/server";
import { UniversityService } from "@/src/features/universities/service/university";
import { UniversityRepository } from "@/src/features/universities/repository/university.repository";
import { universityFiltersSchema } from "@/src/features/universities/validation/university.schema";

const universityRepository = new UniversityRepository();
const universityService = new UniversityService(universityRepository);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const result = universityFiltersSchema.safeParse(Object.fromEntries(searchParams.entries()));

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 });
    }

    const universities = await universityService.search(result.data);

    return NextResponse.json(universities);
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "Failed to fetch universities" }, { status: 500 });
  }
}

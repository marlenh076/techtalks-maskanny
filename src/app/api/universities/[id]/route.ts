import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { UniversityService } from "@/src/features/universities/service/university";
import { UniversityRepository } from "@/src/features/universities/repository/university.repository";

const universityRepository = new UniversityRepository();
const universityService = new UniversityService(universityRepository);

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

    const university = await universityService.getById(id);

    if (!university) {
      return NextResponse.json(
        { error: "University not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(university);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch university" },
      { status: 500 },
    );
  }
}

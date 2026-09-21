import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { MediaService } from "@/src/features/property/service/media";
import { MediaRepository } from "@/src/features/property/repository/media.repository";
import { mediaSchema } from "@/src/features/property/validation/media.schema";

import { BoostingPlanService } from "@/src/features/boosting/service/boosting_plan";
import { BoostingPlanRepository } from "@/src/features/boosting/repository/boosting_plan.repository";
import { PropertyBoostingService } from "@/src/features/boosting/service/property_boosting";
import { PropertyBoostingRepository } from "@/src/features/boosting/repository/property_boosting.repository";

const mediaRepository = new MediaRepository();

const propertyBoostingRepository = new PropertyBoostingRepository();
const propertyBoostingService = new PropertyBoostingService(
  propertyBoostingRepository,
);

const boostingPlanRepository = new BoostingPlanRepository();
const boostingPlanService = new BoostingPlanService(boostingPlanRepository);

const mediaService = new MediaService(
  mediaRepository,
  propertyBoostingService,
  boostingPlanService,
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const media = await mediaService.getByPropertyId(id);

    return NextResponse.json(media);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch property media" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const result = mediaSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid media data",
          details: z.treeifyError(result.error),
        },
        { status: 400 },
      );
    }

    const media = await mediaService.create({
      property_id: id,
      url: result.data.url,
      type: result.data.type,
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create media" },
      { status: 500 },
    );
  }
}

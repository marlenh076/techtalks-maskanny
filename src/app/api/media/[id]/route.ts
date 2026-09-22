import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { MediaService } from "@/src/features/properties/service/media";
import { MediaRepository } from "@/src/features/properties/repository/media.repository";
import { mediaSchema } from "@/src/features/properties/validation/media.schema";

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

    const media = await mediaService.getById(id);

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    return NextResponse.json(media);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch media" },
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

    const result = mediaSchema.partial().safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid media data",
          details: z.treeifyError(result.error),
        },
        { status: 400 },
      );
    }

    const media = await mediaService.update(id, result.data);

    return NextResponse.json(media);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update media" },
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

    const existingMedia = await mediaService.getById(id);

    if (!existingMedia) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    await mediaService.delete(id);

    return NextResponse.json({
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 },
    );
  }
}

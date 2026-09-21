import { NextRequest, NextResponse } from "next/server";

import { BoostingPlanService } from "@/src/features/boosting/service/boosting_plan";
import { BoostingPlanRepository } from "@/src/features/boosting/repository/boosting_plan.repository";

const boostingPlanRepository = new BoostingPlanRepository();
const boostingPlanService = new BoostingPlanService(boostingPlanRepository);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const plan = await boostingPlanService.getById(id);

    if (!plan) {
      return NextResponse.json(
        { error: "Boosting plan not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch boosting plan" },
      { status: 500 },
    );
  }
}

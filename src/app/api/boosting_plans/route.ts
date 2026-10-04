import { NextResponse } from "next/server";

import { BoostingPlanService } from "@/src/features/boosting/service/boosting_plan";
import { BoostingPlanRepository } from "@/src/features/boosting/repository/boosting_plan.repository";

const boostingPlanRepository = new BoostingPlanRepository();
const boostingPlanService = new BoostingPlanService(boostingPlanRepository);

export async function GET() {
  try {
    const plans = await boostingPlanService.getAll();

    return NextResponse.json(plans);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch boosting plans" },
      { status: 500 },
    );
  }
}

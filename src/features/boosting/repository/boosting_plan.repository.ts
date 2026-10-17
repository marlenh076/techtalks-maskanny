import { supabase } from "../../../lib/supabase/client";
import { BoostingPlan } from "../models/boosting_plan.model";
import { IBoostingPlanRepository } from "../repository/IBoosting_plan.repository";

export class BoostingPlanRepository implements IBoostingPlanRepository {
  async getById(id: string): Promise<BoostingPlan | null> {
    const { data: plan, error } = await supabase
      .from("boosting_plan")
      .select("*")
      .eq("boosting_plan_id", id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return plan;
  }

  async getAll(): Promise<BoostingPlan[]> {
    const { data: plans, error } = await supabase.from("boosting_plan").select("*");

    if (error) {
      throw new Error(error.message);
    }

    return plans;
  }
}

import { BoostingPlan } from "../models/boosting_plan.model";
import { IBoostingPlanRepository } from "../repository/IBoosting_plan.repository";

export class BoostingPlanService {
  constructor(private boostingPlanRepository: IBoostingPlanRepository) {}

  async getAll(): Promise<BoostingPlan[]> {
    return this.boostingPlanRepository.getAll();
  }

  async getById(id: string): Promise<BoostingPlan | null> {
    return this.boostingPlanRepository.getById(id);
  }
}

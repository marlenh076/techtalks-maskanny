import { BoostingPlan } from "../models/boosting_plan.model";
import { IReadRepository } from "../../../shared/repositories/read.repository";

export type IBoostingPlanRepository = IReadRepository<BoostingPlan>;

export interface PropertyBoosting {
  property_boosting_id: string;
  property_id: string;
  boosting_plan_id: string;
  is_paid: boolean;
  start_date: string | null;
  end_date: string | null;
  status: "pending" | "active" | "expired";
}

export type PropertyBoostingCreate = Pick<
  PropertyBoosting,
  "property_id" | "boosting_plan_id"
>;

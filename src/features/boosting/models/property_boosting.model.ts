export interface PropertyBoosting {
  property_boosting_id: string;
  property_id: string;
  boosting_plan_id: string;
  is_paid: boolean;
  start_date: string;
  end_date: string;
  status: "active" | "expired";
}

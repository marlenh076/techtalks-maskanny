export interface BoostingPlan {
  boosting_plan_id: string;
  name: string;
  duration_days: number;
  price: number;
  currency: string | null;
  max_images: number;
  video_enabled: boolean;
  top_placement: boolean;
}

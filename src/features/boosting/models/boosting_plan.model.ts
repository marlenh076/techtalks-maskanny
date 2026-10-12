export interface BoostingPlan {
  boosting_plan_id: string;
  name: string;
  duration_days: number;
  price: number;
  max_images: number;
  video_enabled: boolean;
  top_placement: boolean;
  currency: string | null;
}

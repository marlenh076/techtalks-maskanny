import { BoostingPlan } from "@/src/features/boosting/models/boosting_plan.model";
import { PropertyBoosting } from "@/src/features/boosting/models/property_boosting.model";
import { User } from "@/src/features/users/models/user.model";

import { Media } from "./media.model";
import { Property } from "./property.model";

export type ModerationStatus = Property["approval_status"];

export interface ModerationPropertySummary {
  property_id: Property["property_id"];
  title: Property["title"];
  property_type: Property["property_type"];
  price: Property["price"];
  approval_status: ModerationStatus;
  created_at: Property["created_at"];
  host: Pick<User, "firstname" | "lastname">;
  cover_image: string | null;
  request_type: "initial" | "renewal" | null;
  boost_request: {
    property_boosting_id: PropertyBoosting["property_boosting_id"];
    boosting_plan_id: PropertyBoosting["boosting_plan_id"];
    plan: Pick<BoostingPlan, "name" | "duration_days" | "price">;
  } | null;
}

export interface ModerationPropertyDetails {
  property: Property;
  media: Pick<Media, "media_id" | "url" | "type">[];
  host: Pick<User, "firstname" | "lastname" | "phone">;
  boost: (PropertyBoosting & { plan: BoostingPlan }) | null;
}

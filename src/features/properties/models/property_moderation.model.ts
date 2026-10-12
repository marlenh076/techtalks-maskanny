import { BoostingPlan } from "@/src/features/boosting/models/boosting_plan.model";
import { PropertyBoosting } from "@/src/features/boosting/models/property_boosting.model";
import { User } from "@/src/features/users/models/user.model";

import { Media } from "./media.model";
import { Property } from "./property.model";
import type {
  AdminActivity,
} from "@/src/features/admin/models/admin.model";

export type ModerationStatus = Property["approval_status"];

export interface ModerationPropertySummary {
  property_id: Property["property_id"];
  title: Property["title"];
  property_type: Property["property_type"];
  price: Property["price"];
  approval_status: ModerationStatus;
  is_live: boolean;
  created_at: Property["created_at"];
  host: Pick<User, "user_id" | "firstname" | "lastname" | "email" | "phone"> & {
    host_id: string;
  };
  cover_image: string | null;
  request_type: "initial" | "renewal" | null;
  boost_request: (PropertyBoosting & { plan: BoostingPlan }) | null;
}

export interface ModerationPropertyDetails {
  property: Property;
  media: Pick<Media, "media_id" | "url" | "type">[];
  host: User & { host_id: string };
  boost: (PropertyBoosting & { plan: BoostingPlan }) | null;
  history: AdminActivity[];
}

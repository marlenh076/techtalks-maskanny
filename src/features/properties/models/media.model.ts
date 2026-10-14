export interface Media {
  media_id: string;
  property_id: string;
  url: string;
  type: "image" | "video";
  sort_order?: number;
}

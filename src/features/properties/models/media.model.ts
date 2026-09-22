export enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
}

export interface Media {
  media_id: string;
  property_id: string;
  url: string;
  type: MediaType;
}

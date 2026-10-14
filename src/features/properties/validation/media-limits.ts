export const MAX_PROPERTY_IMAGES = 6;
export const MAX_PROPERTY_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
// Retained for videos and the independent existing media-update flow.
export const MAX_MEDIA_FILE_SIZE = 50 * 1024 * 1024;
export const PROPERTY_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const PROPERTY_MEDIA_TYPES = [...PROPERTY_IMAGE_TYPES, "video/mp4", "video/webm"];

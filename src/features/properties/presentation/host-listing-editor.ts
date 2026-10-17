import { propertyUpdateSchema } from "../validation/property.schema";
import {
  MAX_PROPERTY_IMAGES,
  MAX_PROPERTY_IMAGE_FILE_SIZE,
  PROPERTY_IMAGE_TYPES,
} from "../validation/media-limits";

export type PropertyEditValues = {
  title: string;
  price: number;
  description: string | null;
  property_type: "dorm" | "studio" | "apartment";
  bedrooms: number;
  bathrooms: number;
  bed_count: number;
  furnished: boolean;
  electricity_included: boolean;
  kitchen_type: "private" | "shared";
  bathroom_type: "private" | "shared";
  gender: "boys" | "girls" | "mixed";
};

export function validatePropertyEdit(values: unknown) {
  return propertyUpdateSchema.safeParse(values);
}

export function validatePhotoAdditions(
  files: File[],
  currentCount: number,
  maxImages: number,
): string | null {
  if (!Number.isInteger(maxImages) || maxImages < 0)
    return "The image limit for this boost plan is unavailable.";
  if (files.some((file) => !PROPERTY_IMAGE_TYPES.includes(file.type)))
    return "Choose JPG, PNG, or WEBP images only.";
  if (files.some((file) => file.size === 0 || file.size > MAX_PROPERTY_IMAGE_FILE_SIZE))
    return "Each photo must be nonempty and 5 MB or smaller.";
  if (currentCount + files.length > Math.min(MAX_PROPERTY_IMAGES, maxImages)) {
    return `This property can have up to ${Math.min(MAX_PROPERTY_IMAGES, maxImages)} photos with its current plan.`;
  }
  return null;
}

export type PendingPhoto = { file: File; preview: string; requestId: string };

export async function savePhotoChanges(input: {
  propertyId: string;
  token: string;
  additions: PendingPhoto[];
  removals: string[];
  startingOrder: number;
  request: <T>(path: string, token: string, init?: RequestInit) => Promise<T>;
}) {
  for (let index = 0; index < input.additions.length; index += 1) {
    const photo = input.additions[index];
    const form = new FormData();
    form.append("file", photo.file);
    form.append("sort_order", String(input.startingOrder + index));
    await input.request(
      `/api/properties/${encodeURIComponent(input.propertyId)}/media`,
      input.token,
      { method: "POST", headers: { "Idempotency-Key": photo.requestId }, body: form },
    );
  }
  for (const mediaId of input.removals) {
    await input.request(`/api/media/${encodeURIComponent(mediaId)}`, input.token, {
      method: "DELETE",
    });
  }
}

export async function saveListingChanges(input: {
  propertyId: string;
  token: string;
  values: Partial<PropertyEditValues>;
  additions: PendingPhoto[];
  removals: string[];
  startingOrder: number;
  request: <T>(path: string, token: string, init?: RequestInit) => Promise<T>;
}) {
  await input.request(`/api/properties/${encodeURIComponent(input.propertyId)}`, input.token, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input.values),
  });
  await savePhotoChanges(input);
}

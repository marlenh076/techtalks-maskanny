import type { Property } from "../../models/property.model";

type PropertyCreation = Pick<Property, "created_at" | "property_id">;

function subMillisecondPart(timestamp: string): number {
  // PostgreSQL timestamps retain microseconds; Date.parse truncates to milliseconds.
  const fraction = timestamp.match(/\.(\d+)/)?.[1] ?? "";
  return Number(fraction.padEnd(6, "0").slice(3, 6));
}

export function comparePropertiesNewestFirst(a: PropertyCreation, b: PropertyCreation): number {
  const timestampOrder = Date.parse(b.created_at) - Date.parse(a.created_at)
    || subMillisecondPart(b.created_at) - subMillisecondPart(a.created_at);
  if (timestampOrder) return timestampOrder;
  // UUID order is stable and independent of API ordering or the browser's locale.
  return a.property_id < b.property_id ? -1 : a.property_id > b.property_id ? 1 : 0;
}

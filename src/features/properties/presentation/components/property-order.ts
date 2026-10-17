import type { Property } from "../../models/property.model";

function subMillisecondPart(timestamp: string): number {
  // PostgreSQL timestamps retain microseconds; Date.parse truncates to milliseconds.
  const fraction = timestamp.match(/\.(\d+)/)?.[1] ?? "";
  return Number(fraction.padEnd(6, "0").slice(3, 6));
}

type BoostActivation = Pick<Property, "property_id"> & { boost_activated_at: string };

export function comparePropertyBoostActivationNewestFirst(
  a: BoostActivation,
  b: BoostActivation,
): number {
  const activationOrder =
    Date.parse(b.boost_activated_at) - Date.parse(a.boost_activated_at) ||
    subMillisecondPart(b.boost_activated_at) - subMillisecondPart(a.boost_activated_at);
  if (activationOrder) return activationOrder;
  return a.property_id < b.property_id ? -1 : a.property_id > b.property_id ? 1 : 0;
}

export function selectMostRecentlyActivatedProperty<T extends BoostActivation>(
  properties: readonly T[],
): T[] {
  return [...properties].sort(comparePropertyBoostActivationNewestFirst).slice(0, 1);
}

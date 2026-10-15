export type Coordinates = { latitude: number; longitude: number };

export function getPropertyCoordinates(latitude: unknown, longitude: unknown): Coordinates | null {
  if (typeof latitude !== "number" || typeof longitude !== "number" ||
    !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
    latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  return { latitude, longitude };
}

export function propertyDirectionsUrl({ latitude, longitude }: Coordinates) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${latitude},${longitude}`)}`;
}

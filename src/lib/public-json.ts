"use client";

// Public, anonymous GETs only. Share work started by effect replay or by two
// components asking for the same URL. Private requests must not use this map.
const inFlight = new Map<string, Promise<unknown>>();
const recent = new Map<string, { value: unknown; expiresAt: number }>();

export class PublicRequestError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Public request failed (${status})`);
    this.status = status;
  }
}

export function publicJson<T>(path: string, revision = 0, maxAgeMs = 0): Promise<T> {
  const key = `${revision}:${path}`;
  const cached = recent.get(key);
  if (cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.value as T);
  if (cached) recent.delete(key);

  const pending = inFlight.get(key);
  if (pending) return pending as Promise<T>;

  const request = fetch(path, { cache: "no-store" }).then(async (response) => {
    if (!response.ok) throw new PublicRequestError(response.status);
    const value = (await response.json()) as T;
    if (maxAgeMs > 0) {
      recent.set(key, { value, expiresAt: Date.now() + maxAgeMs });
      if (recent.size > 64) {
        for (const [cachedKey, entry] of recent) {
          if (entry.expiresAt <= Date.now()) recent.delete(cachedKey);
        }
        while (recent.size > 64) recent.delete(recent.keys().next().value!);
      }
    }
    return value;
  });
  inFlight.set(key, request);
  void request.then(
    () => inFlight.delete(key),
    () => inFlight.delete(key),
  );
  return request;
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createCookieClient } from "@/src/lib/supabase/cookie-client";

// Bounded per-instance cache/throttle, in addition to the provider account quota.
const searches = new Map<string, number>();
const cache = new Map<string, { expires: number; results: unknown }>();
const providerResult = z.object({
  formatted: z.string(), lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180),
});

export async function GET(request: NextRequest) {
  const client = await createCookieClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Sign in to search addresses." }, { status: 401 });
  const { data: host, error: hostError } = await client.from("host").select("host_id").eq("user_id", user.id).maybeSingle();
  if (hostError) return NextResponse.json({ error: "Could not check Host access." }, { status: 503 });
  if (!host) return NextResponse.json({ error: "Host access required." }, { status: 403 });
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length < 3 || query.length > 300) return NextResponse.json({ error: "Enter an address between 3 and 300 characters." }, { status: 400 });
  const key = process.env.GEOAPIFY_API_KEY;
  if (!key) return NextResponse.json({ error: "Address search is unavailable. Select the property on the map." }, { status: 503 });
  const now = Date.now();
  const saved = cache.get(query);
  if (saved && saved.expires > now) return NextResponse.json({ results: saved.results });
  if (now - (searches.get(user.id) ?? 0) < 1000) return NextResponse.json({ error: "Please wait a moment before searching again." }, { status: 429 });
  if (searches.size >= 1000) searches.delete(searches.keys().next().value!);
  searches.set(user.id, now);
  try {
    const url = new URL("https://api.geoapify.com/v1/geocode/search");
    url.search = new URLSearchParams({ text: query, format: "json", limit: "5", apiKey: key }).toString();
    const response = await fetch(url, { signal: AbortSignal.timeout(8000), cache: "no-store" });
    if (!response.ok) throw new Error("Provider unavailable");
    const body = z.object({ results: z.array(providerResult) }).parse(await response.json());
    const results = body.results.map((item) => ({ address: item.formatted, latitude: item.lat, longitude: item.lon }));
    if (cache.size >= 100) cache.delete(cache.keys().next().value!);
    cache.set(query, { expires: now + 3600000, results });
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Address search is unavailable. Select the property on the map or try again." }, { status: 502 });
  }
}

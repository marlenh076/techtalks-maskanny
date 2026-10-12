import { z } from "zod";
import { getCurrentAdmin } from "@/src/features/users/service/current_admin";
import { getAccessToken } from "@/src/lib/supabase/auth";
import { AdminRepository } from "./repository/admin.repository";
import { AdminError } from "./service/errors";
import { queryObject } from "./validation/admin.schema";

export type IdContext = { params: Promise<{ id: string }> };
export function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store", ...headers } });
}
export async function body<T>(request: Request, schema: z.ZodType<T>, optional = false): Promise<T> {
  const text = new TextDecoder().decode(await boundedBody(request, 20000));
  let input: unknown;
  try { input = text ? JSON.parse(text) : optional ? {} : undefined; }
  catch { throw new AdminError("Invalid JSON body", 400); }
  return schema.parse(input);
}
export async function boundedBody(request: Request, limit: number): Promise<Uint8Array> {
  if (Number(request.headers.get("content-length")) > limit) throw new AdminError("Request body too large", 413);
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new AdminError("Request body too large", 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const result = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.byteLength; }
  return result;
}
export function query<T>(request: Request, schema: z.ZodType<T>): T {
  let input;
  try { input = queryObject(request.url); }
  catch { throw new AdminError("Duplicate query parameter", 400); }
  return schema.parse(input);
}
export async function authorized(request: Request, action: (repo: AdminRepository, userId: string) => Promise<Response>) {
  try {
    const admin = await getCurrentAdmin(request);
    if (!admin.authorized) throw new AdminError(admin.status === 401 ? "Unauthorized" : "Forbidden", admin.status);
    return await action(new AdminRepository(getAccessToken(request)!), admin.userId);
  } catch (error) {
    if (error instanceof z.ZodError) return json({ error: "Invalid input", details: z.treeifyError(error) }, 400);
    if (error instanceof AdminError) return json({ error: error.message }, error.status);
    // Do not log query strings, bodies, provider responses, or credentials.
    console.error("[admin.http] Unhandled error " + JSON.stringify({
      path: new URL(request.url).pathname,
      kind: error instanceof Error ? error.name : typeof error,
    }));
    return json({ error: "Internal server error" }, 500);
  }
}

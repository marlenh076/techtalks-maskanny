import { z } from "zod";
import { supabase } from "@/src/lib/supabase/client";
import { userUpdateSchema } from "../validation/user.schema";
import type { UserProfileUpdate } from "../models/user.model";

const profileSchema = z.object({
  user_id: z.uuid(), firstname: z.string(), lastname: z.string(),
  email: z.string(), phone: z.string(), created_at: z.string(),
});
export type UserProfile = z.infer<typeof profileSchema>;
export type ProfileFields = Required<UserProfileUpdate>;

export function validateProfileFields(values: ProfileFields) {
  return userUpdateSchema.required().safeParse({
    firstname: values.firstname.trim(), lastname: values.lastname.trim(), phone: values.phone.trim(),
  });
}

export class ProfileRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

/** Bearer identity must still match the rendered account, including on Save. */
export function createProfileApi(
  session: () => Promise<{ userId: string; token: string } | null>,
  fetcher: typeof fetch = fetch,
) {
  async function request(userId: string, signal?: AbortSignal, changes?: ProfileFields): Promise<UserProfile> {
    const current = await session();
    if (!current || current.userId !== userId) throw new ProfileRequestError("Your session has changed. Please sign in again.", 401);
    if (signal?.aborted) throw new DOMException("Request cancelled", "AbortError");
    const response = await fetcher(`/api/users/${encodeURIComponent(userId)}`, {
      method: changes ? "PATCH" : "GET", cache: "no-store", signal,
      headers: { Authorization: `Bearer ${current.token}`, ...(changes ? { "Content-Type": "application/json" } : {}) },
      ...(changes ? { body: JSON.stringify(changes) } : {}),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new ProfileRequestError(
      response.status === 401 ? "Your session has expired. Please sign in again."
        : response.status === 403 ? "You don't have permission to update this profile."
          : typeof payload?.error === "string" ? payload.error : "We couldn't complete the request. Please try again.",
      response.status,
    );
    const parsed = profileSchema.safeParse(payload);
    if (!parsed.success || parsed.data.user_id !== userId) throw new ProfileRequestError("The server returned an invalid profile. Please try again.", 502);
    return parsed.data;
  }
  return {
    get: (userId: string, signal?: AbortSignal) => request(userId, signal),
    update: (userId: string, values: ProfileFields, signal?: AbortSignal) => {
      const result = validateProfileFields(values);
      if (!result.success) throw new ProfileRequestError("Check your name and phone number before saving.", 400);
      return request(userId, signal, result.data);
    },
  };
}

export const profileApi = createProfileApi(async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) return null;
  return { userId: session.user.id, token: session.access_token };
});

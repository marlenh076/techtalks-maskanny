import { authorized, boundedBody, json } from "@/src/features/admin/http";
import { avatarExtension } from "@/src/features/admin/service/settings";
import { AdminError } from "@/src/features/admin/service/errors";
export async function POST(request: Request) {
  return authorized(request, async (repo, userId) => {
    const uploadBody = await boundedBody(request, 2200000);
    let form: FormData;
    try {
      form = await new Response(uploadBody as BodyInit, {
        headers: { "Content-Type": request.headers.get("content-type") ?? "" },
      }).formData();
    } catch {
      throw new AdminError("Invalid multipart body", 400);
    }
    const file = form.get("file");
    if (!(file instanceof File) || form.getAll("file").length !== 1)
      throw new AdminError("One file is required", 400);
    if (file.size > 2097152) throw new AdminError("Avatar exceeds 2 MiB", 413);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const ext = avatarExtension(bytes, file.type);
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const bucket = repo.client.storage.from("admin-avatars");
    const upload = await bucket.upload(path, bytes, {
      contentType: file.type,
      upsert: false,
    });
    if (upload.error) throw new AdminError("Avatar upload failed", 502);
    try {
      return json(await repo.updateProfile({ avatar_path: path }));
    } catch (error) {
      await bucket.remove([path]);
      throw error;
    }
  });
}

import { supabase, createAuthenticatedClient } from "./client";

export class StorageService {
  async upload(
    accessToken: string,
    bucket: string,
    path: string,
    file: File,
    upsert = false,
  ) {
    const authenticatedSupabase = createAuthenticatedClient(accessToken);

    const { error } = await authenticatedSupabase.storage
      .from(bucket)
      .upload(path, file, { upsert });

    if (error) {
      throw new Error(error.message);
    }
  }

  async delete(accessToken: string, bucket: string, path: string) {
    const authenticatedSupabase = createAuthenticatedClient(accessToken);

    const { error } = await authenticatedSupabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw new Error(error.message);
    }
  }

  async deleteFolder(accessToken: string, bucket: string, folderPath: string) {
    const authenticatedSupabase = createAuthenticatedClient(accessToken);
    const storage = authenticatedSupabase.storage.from(bucket);

    const deletePath = async (path: string): Promise<void> => {
      while (true) {
        const { data: entries, error: listError } = await storage.list(path, {
          limit: 100,
          offset: 0,
        });

        if (listError) {
          throw new Error(listError.message);
        }

        if (!entries?.length) {
          return;
        }

        const filePaths = entries
          .filter((entry) => entry.id !== null)
          .map((entry) => `${path}/${entry.name}`);

        if (filePaths.length) {
          const { error: deleteError } = await storage.remove(filePaths);

          if (deleteError) {
            throw new Error(deleteError.message);
          }
        }

        for (const folder of entries.filter((entry) => entry.id === null)) {
          await deletePath(`${path}/${folder.name}`);
        }
      }
    };

    await deletePath(folderPath);
  }

  getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);

    return data.publicUrl;
  }
}

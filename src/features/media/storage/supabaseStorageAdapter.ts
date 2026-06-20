/** Supabase private-storage adapter. Signed URLs are short-lived and access remains subject to Storage RLS. */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DeleteFileInput, GetSignedUrlInput, SignedFileUrl, StorageAdapter, UploadedFile, UploadFileInput } from "../storageAdapter";

export class SupabaseStorageAdapter implements StorageAdapter {
  constructor(private readonly client: SupabaseClient) {}
  async uploadFile(input: UploadFileInput): Promise<UploadedFile> {
    if (input.signal?.aborted) throw new DOMException("Upload cancelled", "AbortError");
    input.onProgress?.(5);
    const { error } = await this.client.storage.from(input.bucket).upload(input.path, input.body, { contentType: input.contentType, cacheControl: input.cacheControl ?? "31536000", upsert: input.upsert ?? false });
    if (error) throw error;
    input.onProgress?.(100);
    return { bucket: input.bucket, path: input.path, bytes: input.body.size };
  }
  async getSignedUrl(input: GetSignedUrlInput): Promise<SignedFileUrl> {
    const { data, error } = await this.client.storage.from(input.bucket).createSignedUrl(input.path, input.expiresIn);
    if (error) throw error;
    return { url: data.signedUrl, expiresAt: new Date(Date.now() + input.expiresIn * 1000).toISOString() };
  }
  async deleteFile(input: DeleteFileInput): Promise<void> { const { error } = await this.client.storage.from(input.bucket).remove(input.paths); if (error) throw error; }
}

/** Short-lived in-memory cache for signed URLs. Never persist signed URLs in localStorage or treat them as permanent asset URLs. */
import type { GetSignedUrlInput, SignedFileUrl, StorageAdapter } from "./storageAdapter";

export class SignedUrlCache {
  private entries = new Map<string, SignedFileUrl>();
  constructor(private readonly storage: StorageAdapter, private readonly refreshBufferMs = 30_000) {}
  async get(input: GetSignedUrlInput) {
    const key = `${input.bucket}:${input.path}`; const cached = this.entries.get(key);
    if (cached && new Date(cached.expiresAt).getTime() - this.refreshBufferMs > Date.now()) return cached.url;
    const fresh = await this.storage.getSignedUrl(input); this.entries.set(key, fresh); return fresh.url;
  }
  invalidate(bucket: string, path: string) { this.entries.delete(`${bucket}:${path}`); }
  clear() { this.entries.clear(); }
}

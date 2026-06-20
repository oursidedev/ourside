/** Upload workflow shared by web and future mobile clients once variants have been prepared by a platform compressor. */
import { buildMediaStoragePath } from "./imageVariants";
import type { PreparedImage } from "./media.types";
import type { StorageAdapter, UploadedFile } from "./storageAdapter";

export class MediaService {
  constructor(private readonly storage: StorageAdapter, private readonly bucket = "couple-media") {}
  async uploadPreparedImage(input: { coupleId: string; memoryId: string; mediaId: string; image: PreparedImage; signal?: AbortSignal; onProgress?: (percent: number) => void }) {
    const uploaded: UploadedFile[] = [];
    try {
      for (let index = 0; index < input.image.variants.length; index += 1) {
        const variant = input.image.variants[index];
        const path = buildMediaStoragePath({ ...input, variant: variant.name, extension: variant.extension });
        uploaded.push(await this.storage.uploadFile({ bucket: this.bucket, path, body: variant.blob, contentType: variant.mimeType, signal: input.signal, onProgress: (value) => input.onProgress?.(Math.round(((index + value / 100) / input.image.variants.length) * 100)) }));
      }
      return uploaded;
    } catch (error) {
      if (uploaded.length) await this.storage.deleteFile({ bucket: this.bucket, paths: uploaded.map((item) => item.path) }).catch(() => undefined);
      throw error;
    }
  }
}

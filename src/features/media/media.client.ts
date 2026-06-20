/** Client orchestration only. Compression is intentionally isolated from shared services and native clients. */
import { prepareImage } from "./imageCompression";
import { MAX_FILES_PER_SELECTION } from "./media.constants";
import type { MediaPlan, PreparedImage } from "./media.types";

export async function prepareSelectedImages(files: File[], options: { plan?: MediaPlan; signal?: AbortSignal; onFileProgress?: (index: number, progress: number) => void } = {}): Promise<PreparedImage[]> {
  if (files.length > MAX_FILES_PER_SELECTION) throw new Error(`Choose up to ${MAX_FILES_PER_SELECTION} photos at a time.`);
  const prepared: PreparedImage[] = [];
  for (let index = 0; index < files.length; index += 1) {
    if (options.signal?.aborted) throw new DOMException("Image preparation cancelled", "AbortError");
    prepared.push(await prepareImage(files[index], options.plan ?? "free", (progress) => options.onFileProgress?.(index, progress)));
  }
  return prepared;
}

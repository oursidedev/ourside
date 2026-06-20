/**
 * Browser-only image processing implementation.
 * Canvas re-encoding resizes the photo and strips unnecessary metadata. React Native must provide
 * a separate compressor behind the same prepared-image contract.
 */
import { IMAGE_MIME_TYPES, IMAGE_VARIANTS, MEDIA_PLAN_LIMITS } from "./media.constants";
import type { ImageVariantName, MediaPlan, PreparedImage, PreparedImageVariant } from "./media.types";

function assertBrowser() { if (typeof window === "undefined" || typeof document === "undefined") throw new Error("Image compression is only available in the browser."); }

async function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Your browser could not optimize this image.")), mimeType, quality));
}

function outputFormat(canvas: HTMLCanvasElement) {
  if (canvas.toDataURL("image/avif", 0.5).startsWith("data:image/avif")) return { mimeType: "image/avif", extension: "avif" };
  if (canvas.toDataURL("image/webp", 0.5).startsWith("data:image/webp")) return { mimeType: "image/webp", extension: "webp" };
  return { mimeType: "image/jpeg", extension: "jpg" };
}

async function decodeImage(file: File): Promise<ImageBitmap> {
  if (!("createImageBitmap" in window)) throw new Error("This browser cannot prepare images safely. Please use a current browser.");
  return createImageBitmap(file, { imageOrientation: "from-image" });
}

async function resize<T extends Exclude<ImageVariantName, "original"> | "blur">(bitmap: ImageBitmap, name: T, maxWidth: number, quality: number): Promise<{ name: T; blob: Blob; mimeType: string; width: number; height: number; extension: string }> {
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Image processing is unavailable on this device.");
  context.imageSmoothingEnabled = true; context.imageSmoothingQuality = "high"; context.drawImage(bitmap, 0, 0, width, height);
  const format = outputFormat(canvas); const blob = await canvasToBlob(canvas, format.mimeType, quality);
  return { name, blob, mimeType: format.mimeType, width, height, extension: format.extension };
}

function readAsDataUrl(blob: Blob) { return new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsDataURL(blob); }); }

export async function prepareImage(file: File, plan: MediaPlan = "free", onProgress?: (percent: number) => void): Promise<PreparedImage> {
  assertBrowser();
  if (!IMAGE_MIME_TYPES.includes(file.type as (typeof IMAGE_MIME_TYPES)[number])) throw new Error("Choose a JPEG, PNG, WebP or AVIF image.");
  const limits = MEDIA_PLAN_LIMITS[plan];
  if (file.size > limits.maxSourceBytes) throw new Error(`Images on this plan must be ${Math.round(limits.maxSourceBytes / 1024 / 1024)} MB or smaller.`);
  onProgress?.(5); const bitmap = await decodeImage(file); onProgress?.(20);
  try {
    const variantInputs = (["thumbnail", "medium", "large"] as const);
    const variants: PreparedImageVariant[] = [];
    for (let index = 0; index < variantInputs.length; index += 1) {
      const name = variantInputs[index]; const config = IMAGE_VARIANTS[name];
      variants.push(await resize(bitmap, name, config.maxWidth, config.quality));
      onProgress?.(35 + index * 20); await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
    }
    if (limits.storeOriginal) variants.push({ name: "original", blob: file, mimeType: file.type, width: bitmap.width, height: bitmap.height, extension: file.name.split(".").pop()?.toLowerCase() || "jpg" });
    const blur = await resize(bitmap, "blur", IMAGE_VARIANTS.blur.maxWidth, IMAGE_VARIANTS.blur.quality);
    const previewVariant = variants.find((item) => item.name === "medium") ?? variants[0];
    onProgress?.(100);
    return { id: crypto.randomUUID(), sourceName: file.name, previewUrl: URL.createObjectURL(previewVariant.blob), blurDataUrl: await readAsDataUrl(blur.blob), metadata: { width: bitmap.width, height: bitmap.height, sourceBytes: file.size, sourceMimeType: file.type }, variants };
  } finally { bitmap.close(); }
}

export function releasePreparedImage(image: PreparedImage) { URL.revokeObjectURL(image.previewUrl); }

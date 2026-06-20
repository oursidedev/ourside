export type MediaPlan = "free" | "plus" | "lifetime";
export type ImageVariantName = "original" | "large" | "medium" | "thumbnail";
export type UploadStatus = "queued" | "compressing" | "uploading" | "complete" | "failed" | "cancelled";

export interface ImageMetadata { width: number; height: number; sourceBytes: number; sourceMimeType: string; }
export interface PreparedImageVariant { name: ImageVariantName; blob: Blob; mimeType: string; width: number; height: number; extension: string; }
export interface PreparedImage { id: string; sourceName: string; previewUrl: string; blurDataUrl: string; metadata: ImageMetadata; variants: PreparedImageVariant[]; }
export interface MediaUploadItem { id: string; fileName: string; previewUrl: string; progress: number; status: UploadStatus; error?: string; prepared?: PreparedImage; }

export interface VideoMetadata { duration: number; width: number; height: number; fileSize: number; mimeType: string; thumbnailUrl: string | null; playbackUrl: string | null; }

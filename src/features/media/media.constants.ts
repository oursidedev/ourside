/** Shared media dimensions; plan limits are sourced from the centralized billing permission model. */
import { BILLING_PLAN_LIMITS } from "@/features/billing/billing.constants";
export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const VIDEO_MIME_TYPES = ["video/mp4", "video/quicktime", "video/webm"] as const;

export const IMAGE_VARIANTS = {
  thumbnail: { maxWidth: 300, quality: 0.72 },
  medium: { maxWidth: 900, quality: 0.8 },
  large: { maxWidth: 1600, quality: 0.84 },
  blur: { maxWidth: 32, quality: 0.45 },
} as const;

export const MEDIA_PLAN_LIMITS = {
  free: { maxSourceBytes: BILLING_PLAN_LIMITS.free.maxSourceBytes, storeOriginal: BILLING_PLAN_LIMITS.free.storeOriginal, maxImageCount: BILLING_PLAN_LIMITS.free.maxPhotos, videoUpload: BILLING_PLAN_LIMITS.free.videoUpload },
  plus: { maxSourceBytes: BILLING_PLAN_LIMITS.plus.maxSourceBytes, storeOriginal: BILLING_PLAN_LIMITS.plus.storeOriginal, maxImageCount: BILLING_PLAN_LIMITS.plus.maxPhotos, videoUpload: BILLING_PLAN_LIMITS.plus.videoUpload },
  lifetime: { maxSourceBytes: BILLING_PLAN_LIMITS.lifetime.maxSourceBytes, storeOriginal: BILLING_PLAN_LIMITS.lifetime.storeOriginal, maxImageCount: BILLING_PLAN_LIMITS.lifetime.maxPhotos, videoUpload: BILLING_PLAN_LIMITS.lifetime.videoUpload },
} as const;

export const SIGNED_URL_TTL_SECONDS = 60 * 15;
export const MAX_FILES_PER_SELECTION = 10;

/** Keep plan limits centralized. UI and media services must not duplicate plan-name checks. */
import type { PlanSlug, PremiumFeature } from "./billing.types";
export const BILLING_PLAN_LIMITS = {
  free: { maxPhotos: 50, maxAlbums: 3, maxFutureLetters: 3, maxSourceBytes: 10*1024*1024, storeOriginal: false, videoUpload: false, voiceNotes: false, premiumThemes: false, relationshipYearbook: false },
  plus: { maxPhotos: Number.POSITIVE_INFINITY, maxAlbums: Number.POSITIVE_INFINITY, maxFutureLetters: Number.POSITIVE_INFINITY, maxSourceBytes: 25*1024*1024, storeOriginal: true, videoUpload: true, voiceNotes: true, premiumThemes: true, relationshipYearbook: true },
  lifetime: { maxPhotos: Number.POSITIVE_INFINITY, maxAlbums: Number.POSITIVE_INFINITY, maxFutureLetters: Number.POSITIVE_INFINITY, maxSourceBytes: 25*1024*1024, storeOriginal: true, videoUpload: true, voiceNotes: true, premiumThemes: true, relationshipYearbook: true },
} as const;
export const PLAN_FEATURES: Record<PlanSlug, readonly PremiumFeature[]> = { free: [], plus: ["video_upload","unlimited_letters","unlimited_albums","premium_themes","relationship_yearbook","store_original_images","voice_notes","full_export"], lifetime: ["video_upload","unlimited_letters","unlimited_albums","premium_themes","relationship_yearbook","store_original_images","voice_notes","full_export"] };
export const MOCK_BILLING_ENABLED = process.env.NODE_ENV !== "production" && process.env.BILLING_MOCK_ENABLED !== "false";

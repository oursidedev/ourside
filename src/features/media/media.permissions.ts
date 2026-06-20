import { MEDIA_PLAN_LIMITS } from "./media.constants";
import type { MediaPlan } from "./media.types";

export function validateMediaEntitlement(input: { plan: MediaPlan; kind: "image" | "video"; sourceBytes: number; currentImageCount: number }): string | null {
  const limits = MEDIA_PLAN_LIMITS[input.plan];
  if (input.sourceBytes > limits.maxSourceBytes) return `This file is larger than ${Math.round(limits.maxSourceBytes / 1024 / 1024)} MB.`;
  if (input.kind === "video" && !limits.videoUpload) return "Video uploads require Ourside Plus.";
  if (input.kind === "image" && input.currentImageCount >= limits.maxImageCount) return "Your current plan's photo limit has been reached.";
  return null;
}

export function canAccessMedia(input: { isCoupleMember: boolean; memoryVisibility: "couple" | "private"; isAuthor: boolean }) {
  return input.isCoupleMember && (input.memoryVisibility === "couple" || input.isAuthor);
}

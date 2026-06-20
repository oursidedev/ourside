import type { IsoDate, IsoDateTime } from "@/types/core";
export type MemoryType = "photo" | "note" | "video";
export type MemoryMood = "joyful" | "cozy" | "adventurous" | "grateful" | "nostalgic" | "peaceful" | "other";
export type MemoryVisibility = "couple" | "private";
export type MediaType = "image" | "video" | "audio";
export type Memory = { id: string; coupleId: string; createdBy: string; title: string; description: string; memoryDate: IsoDate; type: MemoryType; locationName: string | null; locationLat: number | null; locationLng: number | null; mood: MemoryMood | null; isFavorite: boolean; visibility: MemoryVisibility; createdAt: IsoDateTime; updatedAt: IsoDateTime };
export type MemoryMedia = { id: string; coupleId: string; memoryId: string; uploadedBy: string; mediaType: MediaType; storageProvider: "supabase"; storagePathOriginal: string; storagePathLarge: string | null; storagePathMedium: string | null; storagePathThumbnail: string | null; blurDataUrl: string | null; mimeType: string; fileSize: number; width: number | null; height: number | null; duration: number | null; createdAt: IsoDateTime };
export type MemoryComment = { id: string; coupleId: string; memoryId: string; userId: string; body: string; createdAt: IsoDateTime; updatedAt: IsoDateTime };
export type MemoryReaction = { id: string; coupleId: string; memoryId: string; userId: string; reaction: "heart" | "love" | "laugh" | "tears" | "sparkles"; createdAt: IsoDateTime };

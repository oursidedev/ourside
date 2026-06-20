import type { IsoDateTime } from "@/types/core";
export type Album = { id: string; coupleId: string; createdBy: string; title: string; description: string; coverMediaId: string | null; isFavorite: boolean; createdAt: IsoDateTime; updatedAt: IsoDateTime };
export type AlbumMemory = { albumId: string; memoryId: string; coupleId: string; createdAt: IsoDateTime };
export type GalleryView = "masonry" | "timeline";

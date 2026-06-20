/** Gallery repository contract keeps optimized media selection outside UI components. */
import type { CursorPage } from "@/types/core";
import type { MemoryMedia } from "@/features/memories/memory.types";
import type { Album } from "./gallery.types";
export interface GalleryRepository { listAlbums(coupleId: string): Promise<Album[]>; listMedia(input: { coupleId: string; limit: number; cursor?: string | null; albumId?: string }): Promise<CursorPage<MemoryMedia>>; }
export class GalleryService { constructor(private readonly repository: GalleryRepository) {} listAlbums(coupleId: string) { return this.repository.listAlbums(coupleId); } listMedia(input: { coupleId: string; limit?: number; cursor?: string | null; albumId?: string }) { return this.repository.listMedia({ ...input, limit: Math.min(input.limit || 30, 60) }); } }
/** Album repository boundary. Keep media transformation and browser APIs outside this layer. */

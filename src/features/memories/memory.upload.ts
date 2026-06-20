/** Browser upload transaction for the current web composer. Native should call the same repository workflow with its own compressor. */
import { createClient } from "@/lib/supabase/client";
import { MediaService } from "@/features/media/media.service";
import { buildMediaStoragePath } from "@/features/media/imageVariants";
import { SupabaseStorageAdapter } from "@/features/media/storage/supabaseStorageAdapter";
import type { PreparedImage } from "@/features/media/media.types";
import { dispatchNotificationEvent } from "@/features/notifications/notification.events";

export interface CreateMemoryUploadInput { title: string; description: string; memoryDate: string; location: string; mood: string; images: PreparedImage[]; onProgress?: (percent: number) => void; }

export async function createMemoryWithMedia(input: CreateMemoryUploadInput) {
  const client = createClient(); if (!client) throw new Error("Supabase is not configured.");
  const { data: auth, error: authError } = await client.auth.getUser(); if (authError || !auth.user) throw new Error("Please sign in again.");
  const { data: membership, error: membershipError } = await client.from("couple_members").select("couple_id").eq("user_id", auth.user.id).eq("status", "active").maybeSingle();
  if (membershipError || !membership) throw new Error(membershipError?.message || "Create or join an Ourside first.");
  const { data: memory, error: memoryError } = await client.from("memories").insert({ couple_id: membership.couple_id, author_id: auth.user.id, title: input.title.trim(), note: input.description.trim(), description: input.description.trim(), memory_date: input.memoryDate, type: input.images.length ? "photo" : "note", location: input.location.trim() || null, location_name: input.location.trim() || null, mood: input.mood.trim() || null, visibility: "couple" }).select("id").single();
  if (memoryError || !memory) throw new Error(memoryError?.message || "The memory could not be created.");

  const storage = new SupabaseStorageAdapter(client); const mediaService = new MediaService(storage); const uploadedPaths: string[] = [];
  try {
    for (let index = 0; index < input.images.length; index += 1) {
      const image = input.images[index]; const mediaId = crypto.randomUUID();
      const uploaded = await mediaService.uploadPreparedImage({ coupleId: membership.couple_id, memoryId: memory.id, mediaId, image, onProgress: (progress) => input.onProgress?.(Math.round(((index + progress / 100) / input.images.length) * 95)) });
      uploadedPaths.push(...uploaded.map((item) => item.path));
      const path = (name: "original" | "large" | "medium" | "thumbnail") => { const variant = image.variants.find((item) => item.name === name); return variant ? buildMediaStoragePath({ coupleId: membership.couple_id, memoryId: memory.id, mediaId, variant: name, extension: variant.extension }) : null; };
      const display = image.variants.find((item) => item.name === "large") ?? image.variants[0];
      const { error: mediaError } = await client.from("memory_media").insert({ id: mediaId, memory_id: memory.id, couple_id: membership.couple_id, uploaded_by: auth.user.id, url: path("large") || path("medium") || path("thumbnail"), type: "image", alt_text: input.title.trim(), storage_provider: "supabase", storage_path_original: path("original"), storage_path_large: path("large"), storage_path_medium: path("medium"), storage_path_thumbnail: path("thumbnail"), blur_data_url: image.blurDataUrl, mime_type: display.mimeType, file_size: image.metadata.sourceBytes, width: image.metadata.width, height: image.metadata.height, sort_order: index });
      if (mediaError) throw mediaError;
    }
    input.onProgress?.(100);void dispatchNotificationEvent({type:"memory_added",coupleId:membership.couple_id,sourceEntityType:"memory",sourceEntityId:memory.id,metadata:{title:input.title.trim()}});return { id: memory.id };
  } catch (error) {
    if (uploadedPaths.length) await storage.deleteFile({ bucket: "couple-media", paths: uploadedPaths }).catch(() => undefined);
    await client.from("memories").delete().eq("id", memory.id);
    throw error;
  }
}

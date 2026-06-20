import { z } from "zod";
import { IMAGE_MIME_TYPES, VIDEO_MIME_TYPES } from "./media.constants";

export const mediaUploadContextSchema = z.object({ coupleId: z.string().uuid(), memoryId: z.string().uuid(), mediaId: z.string().uuid(), plan: z.enum(["free", "plus", "lifetime"]) });
export const imageDescriptorSchema = z.object({ name: z.string().min(1).max(255), size: z.number().int().positive(), type: z.enum(IMAGE_MIME_TYPES) });
export const videoDescriptorSchema = z.object({ name: z.string().min(1).max(255), size: z.number().int().positive(), type: z.enum(VIDEO_MIME_TYPES) });
export type MediaUploadContext = z.infer<typeof mediaUploadContextSchema>;

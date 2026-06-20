import { z } from "zod";
export const memoryMoodSchema = z.enum(["joyful", "cozy", "adventurous", "grateful", "nostalgic", "peaceful", "other"]);
export const createMemorySchema = z.object({ coupleId: z.string().uuid(), title: z.string().trim().min(1).max(120), description: z.string().trim().max(4000).default(""), memoryDate: z.string().date(), type: z.enum(["photo", "note", "video"]), locationName: z.string().trim().max(160).nullable().optional(), locationLat: z.number().min(-90).max(90).nullable().optional(), locationLng: z.number().min(-180).max(180).nullable().optional(), mood: memoryMoodSchema.nullable().optional(), isFavorite: z.boolean().default(false), visibility: z.literal("couple").default("couple") });
export const memoryCommentSchema = z.object({ memoryId: z.string().uuid(), body: z.string().trim().min(1).max(1000) });
export const memoryReactionSchema = z.object({ memoryId: z.string().uuid(), reaction: z.enum(["heart", "smile", "tears", "sparkles"]) });
export const memoryListSchema = z.object({ coupleId: z.string().uuid(), limit: z.number().int().min(1).max(50).default(20), cursor: z.string().datetime().nullable().optional(), type: z.enum(["photo", "note", "video"]).optional(), favorite: z.boolean().optional(), search: z.string().trim().max(100).optional() });
export type CreateMemoryInput = z.infer<typeof createMemorySchema>;
export type MemoryListInput = z.infer<typeof memoryListSchema>;

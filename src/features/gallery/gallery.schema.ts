import { z } from "zod";
export const albumSchema = z.object({ coupleId: z.string().uuid(), title: z.string().trim().min(1).max(100), description: z.string().trim().max(1000).default(""), coverMediaId: z.string().uuid().nullable().optional(), isFavorite: z.boolean().default(false) });
export const galleryQuerySchema = z.object({ coupleId: z.string().uuid(), limit: z.number().int().min(1).max(60).default(30), cursor: z.string().datetime().nullable().optional(), albumId: z.string().uuid().optional(), favorite: z.boolean().optional(), search: z.string().trim().max(100).optional() });

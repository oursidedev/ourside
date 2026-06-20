import { z } from "zod";
export const createBucketItemSchema = z.object({ coupleId: z.string().uuid(), title: z.string().trim().min(1).max(160), description: z.string().trim().max(1000).nullable().optional(), category: z.enum(["travel", "food", "experiences", "home", "dreams", "random"]) });
export type CreateBucketItemInput = z.infer<typeof createBucketItemSchema>;

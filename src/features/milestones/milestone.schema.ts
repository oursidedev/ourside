import { z } from "zod";
export const milestoneTypeSchema = z.enum(["first_date", "first_trip", "first_i_love_you", "anniversary", "moving_in", "custom"]);
export const createMilestoneSchema = z.object({ coupleId: z.string().uuid(), title: z.string().trim().min(1).max(120), description: z.string().trim().max(1000).nullable().optional(), milestoneDate: z.string().date(), type: milestoneTypeSchema, relatedMemoryId: z.string().uuid().nullable().optional() });
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;

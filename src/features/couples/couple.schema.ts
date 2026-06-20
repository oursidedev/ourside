import { z } from "zod";
export const coupleStyleSchema = z.enum(["classic", "warm", "minimal"]);
export const createCoupleSchema = z.object({ name: z.string().trim().min(1).max(100), relationshipStartDate: z.string().date(), coverImageUrl: z.string().url().nullable().optional(), timezone: z.string().min(1).max(80).default("UTC"), defaultLocale: z.enum(["en", "tr", "de", "es", "fr"]).default("en"), style: coupleStyleSchema.default("warm") });
export const updateCoupleSchema = createCoupleSchema.partial().refine((value) => Object.keys(value).length > 0, "At least one field is required.");
export type CreateCoupleInput = z.infer<typeof createCoupleSchema>;

import { z } from "zod";
export const supportedLocaleSchema = z.enum(["en", "tr", "de", "es", "fr"]);
export const updateProfileSchema = z.object({ firstName: z.string().trim().min(1).max(80), lastName: z.string().trim().min(1).max(80), username: z.string().trim().min(3).max(30).regex(/^[a-z0-9_]+$/).nullable().optional(), locale: supportedLocaleSchema.optional(), timezone: z.string().min(1).max(80).optional() });
export const privacySettingsSchema = z.object({ profileVisibility: z.enum(["private", "partner"]), allowPartnerInvite: z.boolean(), allowMemoryDownload: z.boolean() });
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

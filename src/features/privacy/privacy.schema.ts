import { z } from "zod";
export const updatePrivacySettingsSchema = z.object({ profileVisibility: z.enum(["private", "partner"]), allowPartnerInvite: z.boolean(), allowMemoryDownload: z.boolean() });
export type UpdatePrivacySettingsInput = z.infer<typeof updatePrivacySettingsSchema>;

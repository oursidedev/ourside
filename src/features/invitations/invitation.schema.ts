import { z } from "zod";
export const invitationTokenSchema = z.string().uuid();
export const createInvitationSchema = z.object({ invitedEmail: z.string().trim().email().max(254).transform((value) => value.toLowerCase()).nullable().optional() });
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;

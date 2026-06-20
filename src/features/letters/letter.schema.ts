import { z } from "zod";
export const createLetterSchema = z.object({ coupleId: z.string().uuid(), recipientUserId: z.string().uuid(), title: z.string().trim().min(1).max(120), body: z.string().trim().min(1).max(20000), unlockAt: z.string().datetime(), attachmentMediaId: z.string().uuid().nullable().optional() });
export type CreateLetterInput = z.infer<typeof createLetterSchema>;

import { z } from "zod";
export const submitDailyAnswerSchema = z.object({ coupleId: z.string().uuid(), questionId: z.string().uuid(), answer: z.string().trim().min(1).max(1200), answerDate: z.string().date() }); export type SubmitDailyAnswerInput = z.infer<typeof submitDailyAnswerSchema>;

import { z } from "zod";
import { passwordSchema } from "@/lib/validations/schemas";
export const emailSchema = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
export const signInSchema = z.object({ email: emailSchema, password: z.string().min(1) });
export const signUpSchema = z.object({ firstName: z.string().trim().min(1).max(80), lastName: z.string().trim().min(1).max(80), email: emailSchema, password: passwordSchema });
export const resetPasswordSchema = z.object({ email: emailSchema });
export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

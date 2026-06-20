import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "En az 8 karakter kullanın.")
  .regex(/[A-ZÇĞİÖŞÜ]/, "En az bir büyük harf kullanın.")
  .regex(/[^A-Za-z0-9ÇĞİÖŞÜçğıöşü]/, "En az bir özel karakter kullanın.");

export const authCredentialsSchema = z.object({ email: z.string().email(), password: passwordSchema });
export const memorySchema = z.object({ title: z.string().min(1).max(80), note: z.string().max(1200), date: z.string(), location: z.string().max(120).optional() });
export const letterSchema = z.object({ title: z.string().min(1).max(100), body: z.string().min(1), unlockAt: z.string() });
export const bucketItemSchema = z.object({ title: z.string().min(1).max(100), category: z.enum(["Travel", "Food", "Experiences", "Home", "Dreams", "Random"]) });
export type MemoryInput = z.infer<typeof memorySchema>;

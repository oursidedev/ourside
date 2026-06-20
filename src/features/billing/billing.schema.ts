import { z } from "zod";
export const planSlugSchema = z.enum(["free","plus","lifetime"]);
export const billingIntervalSchema = z.enum(["monthly","yearly","lifetime"]);
export const billingProviderSchema = z.enum(["mock","iyzico","paddle","lemon_squeezy","stripe","apple","google"]);
export const createCheckoutSchema = z.object({ plan: planSlugSchema.refine((value) => value !== "free", "Free does not require checkout."), interval: billingIntervalSchema, region: z.enum(["US","TR","EU","GB","CA","AU"]).default("US"), successUrl: z.string().url(), cancelUrl: z.string().url() });
export const createPortalSchema = z.object({ returnUrl: z.string().url() });
export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
export type CreatePortalInput = z.infer<typeof createPortalSchema>;

import type { AuthProvider } from "./auth.types";
export const AUTH_PROVIDERS: readonly AuthProvider[] = ["email", "google", "apple"];
export const DEFAULT_AUTH_REDIRECT = "/dashboard";

// Supabase Auth applies email rate limits. This local cooldown prevents users
// from accidentally triggering repeated verification emails and hitting 429s.
export const AUTH_EMAIL_RESEND_COOLDOWN_SECONDS = 60;

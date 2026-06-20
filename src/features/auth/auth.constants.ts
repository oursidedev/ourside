import type { AuthProvider } from "./auth.types";
export const AUTH_PROVIDERS: readonly AuthProvider[] = ["email", "google", "apple"];
export const DEFAULT_AUTH_REDIRECT = "/dashboard";

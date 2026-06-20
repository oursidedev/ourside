/**
 * Authentication contracts shared by UI and service implementations.
 * Keep provider SDK objects out of these types so an Expo client can reuse them.
 */
import type { IsoDateTime } from "@/types/core";
export type AuthProvider = "email" | "google" | "apple";
export type AuthUser = { id: string; email: string; emailVerified: boolean; providers: AuthProvider[]; createdAt: IsoDateTime };
export type AuthSession = { user: AuthUser; expiresAt: IsoDateTime };
export type AuthState = "loading" | "anonymous" | "authenticated";
export type OnboardingState = "not_started" | "profile_required" | "couple_required" | "partner_pending" | "complete";

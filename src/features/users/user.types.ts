/** User-domain types. These mirror public profile/settings rows, never auth secrets. */
import type { IsoDateTime, SupportedLocale, ThemePreference } from "@/types/core";
export type UserProfile = { id: string; authUserId: string; displayName: string; firstName: string | null; lastName: string | null; username: string | null; email: string | null; avatarUrl: string | null; locale: SupportedLocale; timezone: string; onboardingCompleted: boolean; createdAt: IsoDateTime; updatedAt: IsoDateTime };
export type UserNotificationSettings = { emailEnabled: boolean; pushEnabled: boolean; memoryReminders: boolean; importantDates: boolean; letterUnlocks: boolean; marketingEmails: boolean };
export type UserSettings = { userId: string; theme: ThemePreference; language: SupportedLocale; dateFormat: "regional" | "day_first" | "month_first"; notifications: UserNotificationSettings; updatedAt: IsoDateTime };
export type UserPrivacySettings = { userId: string; profileVisibility: "private" | "partner"; allowPartnerInvite: boolean; allowMemoryDownload: boolean; createdAt: IsoDateTime; updatedAt: IsoDateTime };

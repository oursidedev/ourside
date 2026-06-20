/** Platform-neutral primitives shared by web services and a future Expo client. */
export type EntityId = string;
export type IsoDate = string;
export type IsoDateTime = string;
export type SupportedLocale = "en" | "tr" | "de" | "es" | "fr";
export type ThemePreference = "light" | "dark" | "system";
export type CursorPage<T> = { items: T[]; nextCursor: string | null; hasMore: boolean };
export type ServiceErrorCode = "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "VALIDATION" | "RATE_LIMITED" | "UNKNOWN";
export type ServiceResult<T> = { ok: true; data: T } | { ok: false; code: ServiceErrorCode; message: string };
export type PageRequest = { limit?: number; cursor?: string | null };

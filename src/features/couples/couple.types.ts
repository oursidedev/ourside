/** Couple-space contracts are platform-neutral and shared with future mobile clients. */
import type { IsoDate, IsoDateTime, SupportedLocale } from "@/types/core";
export type CoupleRole = "owner" | "partner";
export type CoupleStatus = "pending_partner" | "active" | "archived";
export type CoupleMemberStatus = "active" | "left" | "removed";
export type Couple = { id: string; name: string; slug: string | null; coverImageUrl: string | null; relationshipStartDate: IsoDate; anniversaryDate: IsoDate | null; timezone: string; defaultLocale: SupportedLocale; status: CoupleStatus; createdBy: string; createdAt: IsoDateTime; updatedAt: IsoDateTime };
export type CoupleMember = { id: string; coupleId: string; userId: string; role: CoupleRole; status: CoupleMemberStatus; joinedAt: IsoDateTime; createdAt: IsoDateTime; updatedAt: IsoDateTime };
export type CoupleAccessContext = { userId: string; coupleId: string; role: CoupleRole; memberCount: number; status: CoupleStatus };

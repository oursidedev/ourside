import type { EntityId, IsoDateTime } from "@/types/core";
export type ProfileVisibility = "private" | "partner";
export interface PrivacySettings { userId: EntityId; profileVisibility: ProfileVisibility; allowPartnerInvite: boolean; allowMemoryDownload: boolean; createdAt: IsoDateTime; updatedAt: IsoDateTime; }

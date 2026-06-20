import type { EntityId, IsoDateTime } from "@/types/core";

export type LetterStatus = "draft" | "scheduled" | "unlocked" | "archived";
export interface Letter { id: EntityId; coupleId: EntityId; createdBy: EntityId; recipientUserId: EntityId; title: string; body: string | null; unlockAt: IsoDateTime; isUnlocked: boolean; status: LetterStatus; attachmentMediaId: EntityId | null; createdAt: IsoDateTime; updatedAt: IsoDateTime; }
export type LetterPreview = Omit<Letter, "body"> & { body: null };

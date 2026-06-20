import type { EntityId, IsoDateTime } from "@/types/core";
export type BucketCategory = "travel" | "food" | "experiences" | "home" | "dreams" | "random"; export type BucketStatus = "planned" | "in_progress" | "completed" | "archived";
export interface BucketListItem { id: EntityId; coupleId: EntityId; createdBy: EntityId; title: string; description: string | null; category: BucketCategory; status: BucketStatus; completedAt: IsoDateTime | null; completedMemoryId: EntityId | null; createdAt: IsoDateTime; updatedAt: IsoDateTime; }

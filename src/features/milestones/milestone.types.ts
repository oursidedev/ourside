import type { EntityId, IsoDate, IsoDateTime } from "@/types/core";
export type MilestoneType = "first_date" | "first_trip" | "first_i_love_you" | "anniversary" | "moving_in" | "custom";
export interface Milestone { id: EntityId; coupleId: EntityId; createdBy: EntityId; title: string; description: string | null; milestoneDate: IsoDate; type: MilestoneType; relatedMemoryId: EntityId | null; createdAt: IsoDateTime; updatedAt: IsoDateTime; }

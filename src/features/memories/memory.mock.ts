import type { CursorPage } from "@/types/core";
import type { Memory } from "./memory.types";
export const memoryDomainMocks: Memory[] = [{ id: "memory-demo", coupleId: "couple-demo", createdBy: "user-one", title: "Our first quiet Sunday", description: "Coffee, rain, and nowhere else to be.", memoryDate: "2026-04-13", type: "photo", locationName: "Home", locationLat: null, locationLng: null, mood: "cozy", isFavorite: true, visibility: "couple", createdAt: "2026-04-13T10:00:00.000Z", updatedAt: "2026-04-13T10:00:00.000Z" }];
export const memoryMockPage: CursorPage<Memory> = { items: memoryDomainMocks, nextCursor: null, hasMore: false };

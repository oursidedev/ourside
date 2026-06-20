/**
 * Memory business layer.
 * Cursor pagination is mandatory so web and future mobile clients never fetch an unbounded timeline.
 */
import type { CursorPage } from "@/types/core";
import type { Memory as LegacyMemory } from "@/types/database";
import type { CreateMemoryInput, MemoryListInput } from "./memory.schema";
import type { Memory, MemoryComment, MemoryReaction } from "./memory.types";
export interface MemoryRepository { list(input: MemoryListInput): Promise<CursorPage<Memory>>; get(id: string): Promise<Memory | null>; create(userId: string, input: CreateMemoryInput): Promise<Memory>; update(id: string, userId: string, input: Partial<CreateMemoryInput>): Promise<Memory>; remove(id: string, userId: string): Promise<void>; addComment(memoryId: string, userId: string, body: string): Promise<MemoryComment>; react(memoryId: string, userId: string, reaction: MemoryReaction["reaction"]): Promise<MemoryReaction>; }
export class MemoryDomainService { constructor(private readonly repository: MemoryRepository) {} list(input: MemoryListInput) { return this.repository.list({ ...input, limit: Math.min(input.limit || 20, 50) }); } create(userId: string, input: CreateMemoryInput) { return this.repository.create(userId, input); } }

// Backward-compatible service retained for the current UI until Part 2 wires the domain repository.
export interface LegacyMemoryRepository { list(coupleId: string): Promise<LegacyMemory[]>; create(input: Omit<LegacyMemory, "id">): Promise<LegacyMemory> }
export class MemoryService { constructor(private readonly repo: LegacyMemoryRepository) {} list(coupleId: string) { return this.repo.list(coupleId); } create(input: Omit<LegacyMemory, "id">) { return this.repo.create(input); } }

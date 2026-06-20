import type { CreateMilestoneInput } from "./milestone.schema"; import type { Milestone } from "./milestone.types";
export interface MilestoneRepository { list(coupleId: string): Promise<Milestone[]>; create(userId: string, input: CreateMilestoneInput): Promise<Milestone>; }
export class MilestoneService { constructor(private readonly repository: MilestoneRepository) {} list(coupleId: string) { return this.repository.list(coupleId); } create(userId: string, input: CreateMilestoneInput) { return this.repository.create(userId, input); } }

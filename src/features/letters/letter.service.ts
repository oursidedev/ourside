/** Platform-neutral letter service. Repository implementations own transport and server enforcement. */
import type { CreateLetterInput } from "./letter.schema";
import type { Letter, LetterPreview } from "./letter.types";
export interface LetterRepository { list(coupleId: string): Promise<LetterPreview[]>; get(id: string): Promise<Letter | LetterPreview | null>; create(userId: string, input: CreateLetterInput): Promise<Letter>; }
export class LetterService { constructor(private readonly repository: LetterRepository) {} list(coupleId: string) { return this.repository.list(coupleId); } create(userId: string, input: CreateLetterInput) { return this.repository.create(userId, input); } }

import type { EntityId, IsoDate, IsoDateTime, SupportedLocale } from "@/types/core";
export interface DailyQuestion { id: EntityId; question: string; locale: SupportedLocale; category: string; active: boolean; createdAt: IsoDateTime; }
export interface DailyAnswer { id: EntityId; coupleId: EntityId; questionId: EntityId; userId: EntityId; answer: string; answerDate: IsoDate; createdAt: IsoDateTime; }
export interface DailyAnswerReveal { revealed: boolean; answers: DailyAnswer[]; }

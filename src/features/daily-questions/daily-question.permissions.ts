/** Both active partners must answer before either answer is revealed. Enforce this in an RPC too. */
export function canRevealDailyAnswers(activeMemberIds: string[], answeredUserIds: string[]) { const answered = new Set(answeredUserIds); return activeMemberIds.length === 2 && activeMemberIds.every((id) => answered.has(id)); }

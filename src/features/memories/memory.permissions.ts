/** UI hints only; RLS must verify couple membership for every mutation. */
export const canEditMemory = (userId: string, createdBy: string) => userId === createdBy;
export const canCommentOnMemory = (isCoupleMember: boolean) => isCoupleMember;

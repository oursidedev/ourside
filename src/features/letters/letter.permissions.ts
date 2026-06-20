/** Letter access rules shared by web and future mobile clients.
 * Locked content must also be withheld by SQL/RPC policy; this helper is not a security boundary.
 */
export function canReadLetterBody(input: { now: Date; unlockAt: string; isRecipient: boolean }) { return input.isRecipient && input.now.getTime() >= new Date(input.unlockAt).getTime(); }

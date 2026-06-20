/** Invitations are single-use; this mirrors server rules for UI state only. */
import type { PartnerInvitation } from "./invitation.types";
export function isInvitationUsable(invitation: PartnerInvitation, now = new Date()) { return invitation.status === "pending" && new Date(invitation.expiresAt).getTime() > now.getTime(); }

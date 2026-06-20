import type { IsoDateTime } from "@/types/core";
export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";
export type PartnerInvitation = { id: string; coupleId: string; invitedBy: string; invitedEmail: string | null; inviteToken: string; status: InvitationStatus; expiresAt: IsoDateTime; acceptedBy: string | null; acceptedAt: IsoDateTime | null; createdAt: IsoDateTime };
export type InvitationPreview = Pick<PartnerInvitation, "inviteToken" | "status" | "expiresAt"> & { coupleName: string; inviterName: string };

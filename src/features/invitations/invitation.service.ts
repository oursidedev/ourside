/**
 * Partner invitation facade.
 * Token acceptance is enforced by database RPCs so web and Expo clients share rules.
 */
import { coupleService } from "@/features/couples/couple.service";
import { invitationTokenSchema } from "./invitation.schema";
export const invitationService = { create: () => coupleService.createPartnerInvite(), preview: (token: string) => coupleService.getInvitePreview(invitationTokenSchema.parse(token)), accept: (token: string) => coupleService.acceptPartnerInvite(invitationTokenSchema.parse(token)) };

/**
 * Client-side permission hints. Supabase RLS remains the authority.
 * Never use these helpers as a replacement for server-side membership checks.
 */
import type { CoupleAccessContext } from "./couple.types";
export const canReadCouple = (access: CoupleAccessContext | null) => Boolean(access?.coupleId);
export const canManageCouple = (access: CoupleAccessContext | null) => access?.role === "owner";
export const canUseSharedFeatures = (access: CoupleAccessContext | null) => access?.status === "active" && access.memberCount === 2;
export const canInvitePartner = (access: CoupleAccessContext | null) => Boolean(access && access.memberCount < 2 && access.status !== "archived");

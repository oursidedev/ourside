/**
 * Current Supabase couple adapter used by the web UI.
 * Membership limits and invite acceptance are enforced by database RPCs, not only by UI state.
 */
import { createClient } from "@/lib/supabase/client";
import { dispatchNotificationEvent } from "@/features/notifications/notification.events";
import { PRODUCT_STATUS } from "@/config/product-status";

type Failure = { ok: false; message: string };
export type PartnerStatus = { ok: true; hasCouple: boolean; coupleName?: string; memberCount: number; complete: boolean } | Failure;
export type InvitePreview = { ok: true; coupleName: string; inviterName: string; expiresAt: string; valid: boolean } | Failure;
export type ActivePartnerInvitation = { id: string; token: string; code: string; expiresAt: string };
export type CoupleAppState = { ok: true; currentUserName: string; hasCouple: boolean; coupleName?: string; memberNames: string[]; memberAvatarUrls: Array<string|null>; startDate?: string; complete: boolean } | Failure;

const missingConfig = "Supabase environment variables are not configured.";

export const coupleService = {
  async getAppState(): Promise<CoupleAppState> {
    const client = createClient();
    if (!client) return { ok: false, message: missingConfig };
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) return { ok: false, message: userError?.message || "Authentication required." };
    const { data: profile } = await client.from("profiles").select("display_name").eq("id", userData.user.id).single();
    const currentUserName = profile?.display_name || userData.user.email?.split("@")[0] || "You";
    const { data: membership, error } = await client.from("couple_members").select("couple_id").eq("user_id", userData.user.id).maybeSingle();
    if (error) return { ok: false, message: error.message };
    if (!membership) return { ok: true, currentUserName, hasCouple: false, memberNames: [currentUserName], memberAvatarUrls:[null], complete: false };

    const [{ data: couple }, { data: members, error: membersError }] = await Promise.all([
      client.from("couples").select("name,start_date").eq("id", membership.couple_id).single(),
      client.from("couple_members").select("user_id,role").eq("couple_id", membership.couple_id).order("joined_at"),
    ]);
    if (membersError) return { ok: false, message: membersError.message };
    const ids = (members || []).map((member) => member.user_id);
    const { data: profiles } = ids.length ? await client.from("profiles").select("id,display_name,avatar_url").in("id", ids) : { data: [] };
    const namesById = new Map((profiles || []).map((item) => [item.id, item.display_name]));
    const memberNames = (members || []).map((member) => namesById.get(member.user_id)).filter((name): name is string => Boolean(name));
    const avatarPaths=new Map((profiles||[]).map(item=>[item.id,item.avatar_url as string|null]));
    const memberAvatarUrls=await Promise.all((members||[]).map(async member=>{const path=avatarPaths.get(member.user_id);if(!path)return null;const signed=await client.storage.from("profile-media").createSignedUrl(path,3600);return signed.data?.signedUrl||null;}));
    return { ok: true, currentUserName, hasCouple: true, coupleName: couple?.name, memberNames, memberAvatarUrls, startDate: couple?.start_date, complete: memberNames.length >= 2 };
  },

  async createCoupleSpace(input: { name: string; startDate: string; style?: "classic" | "warm" | "minimal" }): Promise<{ ok: true; coupleId: string } | Failure> {
    // Existing spaces remain available in portfolio mode; new spaces do not.
    if (!PRODUCT_STATUS.publicSignupEnabled) {
      return { ok: false, message: "Ourside is in portfolio mode. New shared spaces cannot be created." };
    }
    const client = createClient();
    if (!client) return { ok: false, message: missingConfig };
    const current = await this.getPartnerStatus();
    if (current.ok && current.hasCouple) {
      const { data: user } = await client.auth.getUser();
      const { data: membership } = await client.from("couple_members").select("couple_id").eq("user_id", user.user?.id || "").maybeSingle();
      return membership ? { ok: true, coupleId: membership.couple_id } : { ok: false, message: "Unable to find your Ourside." };
    }
    const { data, error } = await client.rpc("create_couple_space", {
      space_name: input.name.trim(),
      relationship_start_date: input.startDate,
      space_cover_url: null,
      space_style: input.style || "warm",
    });
    return error ? { ok: false, message: error.message } : { ok: true, coupleId: String(data) };
  },

  async getPartnerStatus(): Promise<PartnerStatus> {
    const client = createClient();
    if (!client) return { ok: false, message: missingConfig };
    const { data: user } = await client.auth.getUser();
    if (!user.user) return { ok: false, message: "Authentication required." };
    const { data: membership, error } = await client.from("couple_members").select("couple_id").eq("user_id", user.user.id).maybeSingle();
    if (error) return { ok: false, message: error.message };
    if (!membership) return { ok: true, hasCouple: false, memberCount: 0, complete: false };
    const [{ data: couple }, { count, error: countError }] = await Promise.all([
      client.from("couples").select("name").eq("id", membership.couple_id).single(),
      client.from("couple_members").select("id", { count: "exact", head: true }).eq("couple_id", membership.couple_id),
    ]);
    if (countError) return { ok: false, message: countError.message };
    const memberCount = count || 0;
    return { ok: true, hasCouple: true, coupleName: couple?.name, memberCount, complete: memberCount >= 2 };
  },

  async createPartnerInvite(): Promise<{ ok: true; token: string } | Failure> {
    const client = createClient();
    if (!client) return { ok: false, message: missingConfig };
    const { data, error } = await client.rpc("create_partner_invite");
    return error ? { ok: false, message: error.message } : { ok: true, token: String(data) };
  },

  async createPartnerInvitation(): Promise<{ ok: true; invitation: ActivePartnerInvitation } | Failure> {
    const client = createClient(); if (!client) return { ok: false, message: missingConfig };
    const { data, error } = await client.rpc("create_partner_invitation"); const row = data?.[0];
    if(error||!row)return{ok:false,message:error?.message||"Invitation could not be created."};void dispatchNotificationEvent({type:"partner_invited",sourceEntityType:"invitation",sourceEntityId:row.invitation_id,confirmation:true});return{ok:true,invitation:{id:row.invitation_id,token:row.invite_token,code:row.invite_code,expiresAt:row.expires_at}};
  },

  async getActivePartnerInvitation(): Promise<{ ok: true; invitation: ActivePartnerInvitation | null } | Failure> {
    const client = createClient(); if (!client) return { ok: false, message: missingConfig };
    const { data, error } = await client.rpc("get_active_partner_invitation"); const row = data?.[0];
    return error ? { ok: false, message: error.message } : { ok: true, invitation: row ? { id: row.invitation_id, token: row.invite_token, code: row.invite_code, expiresAt: row.expires_at } : null };
  },

  async getInvitePreviewByCode(code: string): Promise<InvitePreview> {
    const client = createClient(); if (!client) return { ok: false, message: missingConfig };
    const { data, error } = await client.rpc("get_partner_invite_preview_by_code", { input_code: normalizeInviteCode(code) }); const invite = data?.[0];
    return error || !invite ? { ok: false, message: error?.message || "Invite code not found." } : { ok: true, coupleName: invite.couple_name, inviterName: invite.inviter_name, expiresAt: invite.expires_at, valid: invite.is_valid };
  },

  async acceptPartnerInviteByCode(code: string): Promise<{ ok: true; coupleId: string } | Failure> {
    const client = createClient(); if (!client) return { ok: false, message: missingConfig };
    const { data, error } = await client.rpc("accept_partner_invite_by_code", { input_code: normalizeInviteCode(code) });
    return error ? { ok: false, message: error.message } : { ok: true, coupleId: String(data) };
  },

  async revokePartnerInvitation(id: string): Promise<{ ok: true } | Failure> {
    const client = createClient(); if (!client) return { ok: false, message: missingConfig };
    const { error } = await client.rpc("revoke_partner_invitation", { target_invitation: id }); return error ? { ok: false, message: error.message } : { ok: true };
  },

  async getInvitePreview(token: string): Promise<InvitePreview> {
    const client = createClient();
    if (!client) return { ok: false, message: missingConfig };
    const { data, error } = await client.rpc("get_partner_invite_preview", { invitation_token: token });
    if (error || !data?.[0]) return { ok: false, message: error?.message || "Invitation not found." };
    const invite = data[0];
    return { ok: true, coupleName: invite.couple_name, inviterName: invite.inviter_name, expiresAt: invite.expires_at, valid: invite.is_valid };
  },

  async acceptPartnerInvite(token: string): Promise<{ ok: true; coupleId: string } | Failure> {
    const client = createClient();
    if (!client) return { ok: false, message: missingConfig };
    const { data, error } = await client.rpc("accept_partner_invite", { invitation_token: token });
    return error ? { ok: false, message: error.message } : { ok: true, coupleId: String(data) };
  },
};

export function normalizeInviteCode(value: string) { const compact = value.trim().toUpperCase().replace(/[^A-Z0-9]/g, ""); return compact.startsWith("OURS") && compact.length === 8 ? `${compact.slice(0, 4)}-${compact.slice(4)}` : value.trim().toUpperCase().replace(/\s+/g, ""); }

import { createClient } from "@/lib/supabase/client";

export type Preferences = { memory_reminders: boolean; important_dates: boolean; letter_unlocks: boolean; theme: "light" | "dark" | "system"; date_format: "regional" | "day_first" | "month_first" };
type Result = { ok: true } | { ok: false; message: string };
const missing = "Supabase environment variables are not configured.";

export const settingsService = {
  async getPreferences(): Promise<{ ok: true; data: Preferences } | { ok: false; message: string }> {
    const client = createClient(); if (!client) return { ok: false, message: missing };
    const { data: user } = await client.auth.getUser(); if (!user.user) return { ok: false, message: "Authentication required." };
    const { data, error } = await client.from("user_preferences").select("memory_reminders,important_dates,letter_unlocks,theme,date_format").eq("user_id", user.user.id).single();
    return error ? { ok: false, message: error.message } : { ok: true, data: data as Preferences };
  },
  async updatePreferences(values: Partial<Preferences>): Promise<Result> {
    const client = createClient(); if (!client) return { ok: false, message: missing };
    const { data: user } = await client.auth.getUser(); if (!user.user) return { ok: false, message: "Authentication required." };
    const { error } = await client.from("user_preferences").upsert({ user_id: user.user.id, ...values, updated_at: new Date().toISOString() });
    return error ? { ok: false, message: error.message } : { ok: true };
  },
  async updateCouple(name: string, startDate: string): Promise<Result> {
    const client = createClient(); if (!client) return { ok: false, message: missing };
    const { data: user } = await client.auth.getUser();
    const { data: membership } = await client.from("couple_members").select("couple_id").eq("user_id", user.user?.id || "").maybeSingle();
    if (!membership) return { ok: false, message: "Ourside not found." };
    const { error } = await client.from("couples").update({ name: name.trim(), start_date: startDate, updated_at: new Date().toISOString() }).eq("id", membership.couple_id);
    return error ? { ok: false, message: error.message } : { ok: true };
  },
  async exportData(): Promise<Result> {
    const client = createClient(); if (!client) return { ok: false, message: missing };
    const { data: user } = await client.auth.getUser();
    const { data: membership } = await client.from("couple_members").select("couple_id").eq("user_id", user.user?.id || "").maybeSingle();
    if (!membership) return { ok: false, message: "Ourside not found." };
    const coupleId = membership.couple_id;
    const [couple, members, memories, albums, letters, milestones, bucket] = await Promise.all([
      client.from("couples").select("*").eq("id", coupleId).single(), client.from("couple_members").select("*").eq("couple_id", coupleId),
      client.from("memories").select("*").eq("couple_id", coupleId), client.from("albums").select("*").eq("couple_id", coupleId),
      client.from("letters").select("*").eq("couple_id", coupleId), client.from("milestones").select("*").eq("couple_id", coupleId),
      client.from("bucket_list_items").select("*").eq("couple_id", coupleId),
    ]);
    const payload = { exportedAt: new Date().toISOString(), couple: couple.data, members: members.data, memories: memories.data, albums: albums.data, letters: letters.data, milestones: milestones.data, bucketList: bucket.data };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `ourside-export-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url);
    return { ok: true };
  },
  async disconnectPartner(): Promise<Result> { const client = createClient(); if (!client) return { ok: false, message: missing }; const { error } = await client.rpc("disconnect_partner"); return error ? { ok: false, message: error.message } : { ok: true }; },
  async deleteAccount(): Promise<Result> { const client = createClient(); if (!client) return { ok: false, message: missing }; const { error } = await client.rpc("delete_my_account", { confirmation: "DELETE" }); return error ? { ok: false, message: error.message } : { ok: true }; },
};

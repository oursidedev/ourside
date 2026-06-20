import type { SupabaseClient, User } from "@supabase/supabase-js";

/** Resolves the authenticated user's active shared space for browser repositories. */
export async function requireCurrentCouple(client: SupabaseClient): Promise<{ user: User; coupleId: string }> {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) throw new Error(error?.message || "Please sign in again.");
  const membership = await client.from("couple_members").select("couple_id").eq("user_id", data.user.id).eq("status", "active").maybeSingle();
  if (membership.error || !membership.data) throw new Error(membership.error?.message || "Create or join an Ourside first.");
  return { user: data.user, coupleId: membership.data.couple_id };
}


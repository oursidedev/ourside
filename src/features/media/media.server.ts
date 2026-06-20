/**
 * Server-only signed URL helper. Never add a service-role key here or import this module into client components.
 * The signed URL is short-lived and Storage RLS verifies the authenticated couple member.
 */
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SIGNED_URL_TTL_SECONDS } from "./media.constants";

export async function createPrivateMediaUrl(path: string, expiresIn = SIGNED_URL_TTL_SECONDS) {
  if (!path.startsWith("couples/") || path.includes("..")) throw new Error("Invalid media path.");
  const client = await createServerSupabaseClient(); if (!client) throw new Error("Supabase is not configured.");
  const { data, error } = await client.storage.from("couple-media").createSignedUrl(path, Math.min(expiresIn, 3600));
  if (error) throw error; return data.signedUrl;
}

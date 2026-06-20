/**
 * Supabase-backed web auth adapter.
 * Keep provider and session details here so UI screens and future native clients
 * can use the same auth workflows without inheriting browser-only logic.
 */
import { createClient } from "@/lib/supabase/client";
import { dispatchNotificationEvent } from "@/features/notifications/notification.events";
import { runtimeAppUrl } from "@/config/brand";

export type AuthResult = { ok: true; requiresEmailConfirmation?: boolean } | { ok: false; message: string; code?: "email_exists" };
type OAuthProvider = "google" | "apple";

const missingConfig = "Supabase environment variables are not configured.";

export const authService = {
  async getOAuthAvailability(): Promise<{ google: boolean; apple: boolean }> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return { google: false, apple: false };
    try {
      const response = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } });
      if (!response.ok) return { google: false, apple: false };
      const settings = await response.json() as { external?: { google?: boolean; apple?: boolean } };
      return { google: Boolean(settings.external?.google), apple: Boolean(settings.external?.apple) };
    } catch {
      return { google: false, apple: false };
    }
  },

  async signUp(input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    redirectTo?: string;
  }): Promise<AuthResult> {
    const client = createClient();
    if (!client) return { ok: false, message: missingConfig };

    const { data, error } = await client.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          first_name: input.firstName,
          last_name: input.lastName,
          display_name: `${input.firstName} ${input.lastName}`.trim(),
        },
        emailRedirectTo: input.redirectTo || runtimeAppUrl("/onboarding"),
      },
    });
    if (error) {
      const duplicate = error.message.toLowerCase().includes("already registered") || error.message.toLowerCase().includes("already exists");
      return duplicate
        ? { ok: false, code: "email_exists", message: "An account already exists with this email address." }
        : { ok: false, message: error.message };
    }

    // With email enumeration protection enabled, Supabase can return a
    // sanitized user with no identities instead of exposing an existing account.
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return { ok: false, code: "email_exists", message: "An account already exists with this email address." };
    }
    return { ok: true, requiresEmailConfirmation: !data.session };
  },

  async resendSignupConfirmation(email: string, redirectTo: string): Promise<AuthResult> {
    const client = createClient();
    if (!client) return { ok: false, message: missingConfig };
    const { error } = await client.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: redirectTo },
    });
    return error ? { ok: false, message: error.message } : { ok: true };
  },

  async signIn(input: { email: string; password: string }): Promise<AuthResult> {
    const client = createClient();
    if (!client) return { ok: false, message: missingConfig };
    const { error } = await client.auth.signInWithPassword(input);
    return error ? { ok: false, message: error.message } : { ok: true };
  },

  async signInWithOAuth(provider: OAuthProvider, redirectTo: string): Promise<AuthResult> {
    const client = createClient();
    if (!client) return { ok: false, message: missingConfig };
    const { error } = await client.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    return error ? { ok: false, message: error.message } : { ok: true };
  },

  async getProfileNames(): Promise<{ ok: true; firstName: string; lastName: string } | { ok: false; message: string }> {
    const client = createClient();
    if (!client) return { ok: false, message: missingConfig };
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) return { ok: false, message: userError?.message || "Authentication required." };
    const { data, error } = await client.from("profiles").select("first_name,last_name").eq("id", userData.user.id).single();
    if (error) return { ok: false, message: error.message };
    return { ok: true, firstName: data.first_name || "", lastName: data.last_name || "" };
  },

  async updateProfileNames(firstName: string, lastName: string): Promise<AuthResult> {
    const client = createClient();
    if (!client) return { ok: false, message: missingConfig };
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) return { ok: false, message: userError?.message || "Authentication required." };
    const displayName = `${firstName.trim()} ${lastName.trim()}`;
    const { error } = await client.from("profiles").update({ first_name: firstName.trim(), last_name: lastName.trim(), display_name: displayName }).eq("id", userData.user.id);
    if (error) return { ok: false, message: error.message };
    const { error: metadataError } = await client.auth.updateUser({ data: { first_name: firstName.trim(), last_name: lastName.trim(), display_name: displayName } });
    if(metadataError)return{ok:false,message:metadataError.message};void dispatchNotificationEvent({type:"profile_updated",sourceEntityType:"profile",sourceEntityId:userData.user.id,confirmation:true});return{ok:true};
  },

  async resetPassword(email: string): Promise<AuthResult> {
    const client = createClient();
    if (!client) return { ok: false, message: missingConfig };
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: runtimeAppUrl("/reset-password"),
    });
    return error ? { ok: false, message: error.message } : { ok: true };
  },

  async updatePassword(password: string): Promise<AuthResult> {
    const client = createClient();
    if (!client) return { ok: false, message: missingConfig };
    const { error } = await client.auth.updateUser({ password });
    if(error)return{ok:false,message:error.message};void dispatchNotificationEvent({type:"password_changed",sourceEntityType:"security",confirmation:true});return{ok:true};
  },

  async updateEmail(email: string): Promise<AuthResult> {
    const client = createClient();
    if (!client) return { ok: false, message: missingConfig };
    const { error } = await client.auth.updateUser({ email });
    return error ? { ok: false, message: error.message } : { ok: true };
  },

  async signOut() {
    const client = createClient();
    if (client) await client.auth.signOut();
  },
};
/**
 * Web auth adapter backed by Supabase Auth.
 * UI code should call this boundary instead of depending on provider details;
 * a future Expo client can implement the same workflows with native redirects.
 */

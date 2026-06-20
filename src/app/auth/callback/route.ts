import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { BRAND } from "@/config/brand";

function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const destination = safeNext(url.searchParams.get("next"));
  // OAuth callbacks use the app host in production. Keeping the request origin
  // on localhost preserves a frictionless local development flow.
  const redirectOrigin = ["localhost", "127.0.0.1"].includes(url.hostname) ? url.origin : BRAND.appUrl;
  const supabase = await createServerSupabaseClient();

  if (!code || !supabase) return NextResponse.redirect(new URL("/login?error=oauth", redirectOrigin));
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=oauth", redirectOrigin));

  const { data } = await supabase.from("profiles").select("first_name,last_name").single();
  if (!data?.first_name || !data?.last_name) {
    return NextResponse.redirect(new URL(`/complete-profile?next=${encodeURIComponent(destination)}`, redirectOrigin));
  }
  return NextResponse.redirect(new URL(destination, redirectOrigin));
}

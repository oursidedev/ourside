import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const destination = safeNext(url.searchParams.get("next"));
  const supabase = await createServerSupabaseClient();

  if (!code || !supabase) return NextResponse.redirect(new URL("/login?error=oauth", url.origin));
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=oauth", url.origin));

  const { data } = await supabase.from("profiles").select("first_name,last_name").single();
  if (!data?.first_name || !data?.last_name) {
    return NextResponse.redirect(new URL(`/complete-profile?next=${encodeURIComponent(destination)}`, url.origin));
  }
  return NextResponse.redirect(new URL(destination, url.origin));
}

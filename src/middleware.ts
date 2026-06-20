import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.search = "";
    login.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(login);
  }

  const partnerRequired = ["/memories", "/gallery", "/vault", "/milestones", "/bucket-list"]
    .some((prefix) => request.nextUrl.pathname === prefix || request.nextUrl.pathname.startsWith(`${prefix}/`));
  if (partnerRequired) {
    const { data: membership } = await supabase.from("couple_members").select("couple_id").eq("user_id", data.user.id).maybeSingle();
    let complete = false;
    if (membership) {
      const { count } = await supabase.from("couple_members").select("id", { count: "exact", head: true }).eq("couple_id", membership.couple_id);
      complete = (count || 0) >= 2;
    }
    if (!complete) {
      const dashboard = request.nextUrl.clone();
      dashboard.pathname = "/dashboard";
      dashboard.search = "";
      dashboard.searchParams.set("locked", "partner");
      return NextResponse.redirect(dashboard);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/memories/:path*",
    "/gallery/:path*",
    "/vault/:path*",
    "/milestones/:path*",
    "/bucket-list/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/complete-profile/:path*",
    "/checkout/:path*",
  ],
};

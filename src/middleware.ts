/**
 * Host-based routing and authenticated app protection.
 *
 * Marketing routes belong on getourside.com. Auth, invite and product routes
 * belong on app.getourside.com. Host redirects run only for configured
 * production domains, so localhost and Vercel previews remain easy to test.
 */
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { BRAND } from "@/config/brand";

const APP_PREFIXES = [
  "/demo",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/auth",
  "/complete-profile",
  "/onboarding",
  "/dashboard",
  "/memories",
  "/gallery",
  "/vault",
  "/milestones",
  "/bucket-list",
  "/settings",
  "/checkout",
  "/invite",
  "/join",
  "/admin",
];
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/memories",
  "/gallery",
  "/vault",
  "/milestones",
  "/bucket-list",
  "/settings",
  "/onboarding",
  "/complete-profile",
  "/checkout",
  "/admin",
];
const PARTNER_PREFIXES = [
  "/memories",
  "/gallery",
  "/vault",
  "/milestones",
  "/bucket-list",
];
const MARKETING_PATHS = ["/pricing", "/privacy", "/terms", "/contact"];

function hasPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
function target(
  base: string,
  request: NextRequest,
  pathname = request.nextUrl.pathname,
) {
  const url = new URL(`${pathname}${request.nextUrl.search}`, `${base}/`);
  return NextResponse.redirect(url, 308);
}
function pageResponse(request: NextRequest, privateHost: boolean) {
  const response = NextResponse.next({ request });
  if (privateHost) response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hostname = (
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    ""
  )
    .split(":")[0]
    .toLowerCase();
  const marketingHost = new URL(BRAND.marketingUrl).hostname;
  const appHost = new URL(BRAND.appUrl).hostname;
  const privateHost = hostname === appHost;

  if (hostname === `www.${BRAND.domain}`)
    return hasPrefix(pathname, APP_PREFIXES)
      ? target(BRAND.appUrl, request)
      : target(BRAND.marketingUrl, request);
  if (hostname === marketingHost && hasPrefix(pathname, APP_PREFIXES))
    return target(BRAND.appUrl, request);
  if (hostname === appHost && MARKETING_PATHS.includes(pathname))
    return target(BRAND.marketingUrl, request);
  if (hostname === appHost && pathname === "/")
    return target(BRAND.appUrl, request, "/demo");

  // Marketing and anonymous auth/invite routes do not need a Supabase session.
  if (!hasPrefix(pathname, PROTECTED_PREFIXES))
    return pageResponse(request, privateHost);

  let response = pageResponse(request, privateHost);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (
        cookiesToSet: { name: string; value: string; options: CookieOptions }[],
      ) => {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = pageResponse(request, privateHost);
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    const next = `${pathname}${request.nextUrl.search}`;
    const login = new URL(
      "/login",
      hostname === appHost ? BRAND.appUrl : request.url,
    );
    login.searchParams.set("next", next);
    return NextResponse.redirect(login);
  }

  if (hasPrefix(pathname, PARTNER_PREFIXES)) {
    const { data: membership } = await supabase
      .from("couple_members")
      .select("couple_id")
      .eq("user_id", data.user.id)
      .maybeSingle();
    let complete = false;
    if (membership) {
      const { count } = await supabase
        .from("couple_members")
        .select("id", { count: "exact", head: true })
        .eq("couple_id", membership.couple_id);
      complete = (count || 0) >= 2;
    }
    if (!complete) {
      const dashboard = new URL(
        "/dashboard?locked=partner",
        hostname === appHost ? BRAND.appUrl : request.url,
      );
      return NextResponse.redirect(dashboard);
    }
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images/).*)"],
};

/**
 * Central brand and public URL configuration.
 *
 * The public website lives on getourside.com while authenticated product flows
 * live on app.getourside.com. These NEXT_PUBLIC values contain no secrets and
 * may be reused by a future mobile client for web/universal links.
 */
export const BRAND = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "Ourside",
  domain: process.env.NEXT_PUBLIC_DOMAIN || "getourside.com",
  marketingUrl: (process.env.NEXT_PUBLIC_MARKETING_URL || "https://getourside.com").replace(/\/$/, ""),
  appUrl: (process.env.NEXT_PUBLIC_APP_URL || "https://app.getourside.com").replace(/\/$/, ""),
  appDomain: process.env.NEXT_PUBLIC_APP_DOMAIN || "app.getourside.com",
  supportEmail: "support@getourside.com",
  helloEmail: "hello@getourside.com",
  noreplyEmail: "noreply@getourside.com",
  tagline: "Our little world, kept forever.",
} as const;

function withPath(base: string, path = "/") { return new URL(path, `${base}/`).toString(); }
export function appUrl(path = "/") { return withPath(BRAND.appUrl, path); }
export function marketingUrl(path = "/") { return withPath(BRAND.marketingUrl, path); }

/** Local development stays on localhost; production links always use the app host. */
export function runtimeAppUrl(path = "/") {
  if (typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)) return withPath(window.location.origin, path);
  return appUrl(path);
}

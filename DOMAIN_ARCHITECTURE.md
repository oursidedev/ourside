# Ourside domain architecture

Production uses one Next.js/Vercel project with two responsibilities:

- `https://getourside.com`: public landing, pricing, privacy, terms and support.
- `https://app.getourside.com`: auth, onboarding, invites and the authenticated product.

`src/config/brand.ts` is the source of truth. Components, emails and invitation services must use `appUrl()` or `marketingUrl()` instead of embedding domains. `runtimeAppUrl()` only preserves localhost during local development; production outputs the app host. This also gives a future mobile client one stable web/universal-link contract.

`src/middleware.ts` redirects app routes opened on the marketing host, redirects public legal/pricing routes opened on the app host, and canonicalizes `www`. Private routes retain Supabase authentication and couple membership checks. Public pages are indexable; authenticated layouts and auth entry pages are `noindex`.

Invite acceptance always uses `app.getourside.com/invite/[token]`. Product email CTAs use the app domain, while privacy and terms links use the marketing domain. Do not replace these with `window.location.origin`: an invite copied from the wrong host would otherwise be invalid architecturally.

Deployment details are split across `VERCEL_SETUP.md`, `HOSTINGER_DNS_GUIDE.md` and `SUPABASE_AUTH_URLS.md`.

> TODO: Add universal links and mobile deep links when the iOS/Android application is introduced.

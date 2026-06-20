# Production deployment guide

## Authentication email prerequisite

Before public beta, complete the manual Resend custom SMTP setup in [SUPABASE_RESEND_SMTP_GUIDE.md](SUPABASE_RESEND_SMTP_GUIDE.md). Supabase Auth SMTP is configured in Supabase Dashboard and cannot be verified safely from application code. Use [AUTH_EMAIL_DEBUG_GUIDE.md](AUTH_EMAIL_DEBUG_GUIDE.md) for delivery or rate-limit failures.

## Environment

Configure Vercel Production variables from `.env.example`. Required public URLs are `NEXT_PUBLIC_MARKETING_URL=https://getourside.com`, `NEXT_PUBLIC_APP_URL=https://app.getourside.com`, `NEXT_PUBLIC_DOMAIN=getourside.com`, and `NEXT_PUBLIC_APP_DOMAIN=app.getourside.com`. Add Supabase URL/anon key normally. `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY` are server-only and must never use the `NEXT_PUBLIC_` prefix.

## Release order

1. Push the production commit and deploy it to Vercel.
2. Add root, `www`, and `app` domains in Vercel.
3. Apply the Hostinger records in `HOSTINGER_DNS_GUIDE.md`.
4. Wait for Vercel SSL certificates to become valid.
5. Set Supabase Auth URLs from `SUPABASE_AUTH_URLS.md`.
6. Verify `/`, `/pricing`, `/privacy`, `/login`, `/dashboard`, `/join`, and an invite URL on their intended hosts.

Build gates are `npm run typecheck`, `npm run lint`, and `npm run build`. Marketing does not need app session cookies. Supabase sessions may remain scoped to the app host, which reduces cross-domain cookie complexity.

## Admin and dynamic plans

Set `ADMIN_EMAILS`, `NEXT_PUBLIC_ANALYTICS_ENABLED`, `ANALYTICS_LIVE_WINDOW_SECONDS`, `BILLING_PROVIDER` and `NEXT_PUBLIC_PUBLIC_PLANS_ENABLED` in Vercel. Apply `202606200015_admin_dynamic_plans.sql` before deploying the matching web build. Verify `/api/public/plans`, owner access to `/admin`, normal-user denial, dynamic pricing and a quota rejection before release.

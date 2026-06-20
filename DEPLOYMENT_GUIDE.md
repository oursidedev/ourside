# Production deployment guide

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

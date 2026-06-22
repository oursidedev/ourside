# Portfolio mode guide

## Current behavior

Ourside is retained as a portfolio case study rather than an open public product.

- `getourside.com` remains public and presents the product and case study.
- `/signup` shows an intentional closed-registration state.
- The auth service rejects signup before calling Supabase or sending email.
- OAuth buttons are hidden while public signup is disabled because a new OAuth identity can create a user.
- New couple-space creation is blocked at the application service boundary.
- Anonymous invite-code users are directed to login, not signup.
- Existing email/password users and administrators can still log in.

## Environment controls

```env
NEXT_PUBLIC_PRODUCT_MODE=portfolio
NEXT_PUBLIC_PUBLIC_SIGNUP_ENABLED=false
NEXT_PUBLIC_DEMO_ACCESS_ENABLED=false
```

These values are centralized in `src/config/product-status.ts`. They are public UX/config values, not authorization secrets.

## Required Supabase safety setting

Application guards reduce accidental calls but cannot secure the public Supabase Auth endpoint by themselves. In Supabase Dashboard, open **Authentication → Providers → Email** and disable **Allow new users to sign up**. Confirm that existing-user login remains enabled. If OAuth providers are enabled, verify that new-user creation is also disabled before relying on them.

Do not delete current users or production data automatically. If test users must be removed, review their couple membership and storage ownership in Supabase first, then delete them manually from Authentication and related tables using a documented backup.

## Re-enabling later

1. Review security, RLS, SMTP, rate limits, privacy, billing, and support readiness.
2. Enable new-user registration in Supabase Auth.
3. Set `NEXT_PUBLIC_PUBLIC_SIGNUP_ENABLED=true` in Vercel for every intended environment.
4. Redeploy so client bundles receive the new public flag.
5. Test email/password and OAuth registration, onboarding, invitations, and rollback.

## Data and admin safety

- Keep `ADMIN_EMAILS=ourside.dev@gmail.com` server-side.
- Never add demo passwords or credentials to Git.
- Never expose real emails, analytics, couple content, or private media on marketing pages.
- Keep private app routes noindexed and authenticated.
- Keep `.env*` secrets ignored; `.env.example` must contain placeholders only.

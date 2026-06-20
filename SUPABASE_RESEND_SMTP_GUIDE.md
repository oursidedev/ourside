# Supabase Auth + Resend SMTP Guide

Ourside authentication email path: `Supabase Auth → Resend custom SMTP → user inbox`.

Supabase Auth sends signup confirmation, password reset, magic-link, and email-change messages through the SMTP provider configured in Supabase Dashboard. This is separate from Ourside-generated partner invitation or memory notification emails, which may later use the Resend API through the application backend.

SMTP credentials belong only in Supabase Dashboard. Never place the SMTP password or a Resend API key in browser code or a `NEXT_PUBLIC_` variable.

## Setup

1. Create or sign in to a Resend account.
2. Add `getourside.com`, or use `mail.getourside.com` if email reputation should be isolated on a subdomain.
3. Add the SPF and DKIM records shown by Resend in the **authoritative DNS provider**. For Ourside this is currently Vercel DNS, not Hostinger. In Vercel open Domains → `getourside.com` → DNS Records, then copy each Resend record's exact type, name, and value. Add DMARC if Resend recommends it. DNS values are unique and must not be invented.
4. Wait until Resend marks the domain as verified.
5. Create a Resend API key and keep it private.
6. Open Supabase Dashboard → Authentication → SMTP Settings and enable custom SMTP:

   | Setting | Value |
   | --- | --- |
   | Host | `smtp.resend.com` |
   | Port | `465` |
   | Username | `resend` |
   | Password | Resend API key |
   | Sender name | `Ourside` |
   | Sender email | `noreply@getourside.com` |

   Port `587` can be tried if `465` does not work with the current Supabase/provider requirements.
7. Open Authentication → URL Configuration:
   - Site URL: `https://app.getourside.com`
   - Redirect URLs:
     - `https://app.getourside.com/**`
     - `https://getourside.com/**`
     - `https://www.getourside.com/**`
     - `https://*.vercel.app/**`
     - `http://localhost:3000/**`
8. Open Authentication → Rate Limits. After custom SMTP works, increase auth-email limits conservatively for beta/testing. Frontend cooldowns reduce accidental requests but do not replace server-side limits.
9. Register with a fresh email address. Expected flow: signup → Supabase Auth → Resend SMTP → Ourside confirmation email.
10. Test password reset separately and inspect both Supabase Auth and Resend logs.

## Supabase email templates

Open Authentication → Email Templates and update Confirm signup, Reset password, Magic link (if enabled), and Change email address. Auth links should return to `app.getourside.com`.

- Confirm subject: `Confirm your Ourside account`
- Confirm copy: “Welcome to Ourside — your private space for memories, letters, and moments together. Confirm your email to start building your Ourside.”
- Reset subject: `Reset your Ourside password`
- Reset copy: “We received a request to reset your Ourside password. If this was you, use the link below to create a new password.”

## Manual setup required

1. Create Resend account.
2. Add getourside.com or mail.getourside.com to Resend.
3. Copy DNS records from Resend.
4. Add DNS records in Vercel because `getourside.com` currently uses Vercel DNS nameservers.
5. Wait for Resend domain verification.
6. Create Resend API key.
7. Open Supabase dashboard.
8. Go to Authentication → SMTP Settings.
9. Enable custom SMTP.
10. Use smtp.resend.com as host.
11. Use port 465.
12. Use username resend.
13. Use Resend API key as password.
14. Use sender name Ourside.
15. Use sender email noreply@getourside.com.
16. Go to Authentication → URL Configuration.
17. Set Site URL to https://app.getourside.com.
18. Add redirect URLs for app, marketing, Vercel preview, and localhost.
19. Go to Authentication → Rate Limits.
20. Increase email limits safely for beta/testing.
21. Test signup.
22. Test password reset.
23. Check Resend logs.
24. Check Supabase Auth logs.

## Production safety

- Never commit `.env`, `.env.local`, or `.env.production`; this repository ignores `.env*` and deliberately allows only `.env.example`.
- Never expose `RESEND_API_KEY`, SMTP passwords, `SUPABASE_SERVICE_ROLE_KEY`, auth tokens, reset tokens, or invite tokens.
- Do not log callback URLs containing tokens and do not store confirmation tokens.
- `EMAIL_PROVIDER` and `RESEND_API_KEY` in the app environment are reserved for app-generated notification email. They do not configure Supabase Auth SMTP.

# Auth Email Debug Guide

When signup or password-reset email fails:

1. Check the friendly message shown by the browser UI.
2. Check Supabase Auth logs for the corresponding request.
3. Check Supabase Authentication → Rate Limits.
4. Check Authentication → SMTP Settings and confirm custom SMTP is enabled.
5. Confirm the Resend domain is verified.
6. Check Resend delivery logs.
7. Check the Hostinger DNS records against the exact records supplied by Resend.
8. Confirm SPF and DKIM are active; check DMARC if configured.
9. Test signup with a fresh email address.
10. Test password reset independently.

## Common failure: email rate limit exceeded

Cause: Supabase's built-in auth sender has strict limits, or repeated UI actions triggered multiple auth-email calls.

Fix: configure Resend custom SMTP in Supabase Dashboard, review auth-email rate limits after SMTP works, and keep duplicate-submit protection plus the 60-second verification resend cooldown enabled.

The central mapper at `src/features/auth/auth-errors.ts` converts Supabase variants (`429`, `over_email_send_rate_limit`, and related messages) into safe English or Turkish copy. Raw provider messages must never be rendered directly by auth screens.

## What not to log

Do not log SMTP/API keys, sessions, password-reset links, confirmation links, callback query strings, passwords, or invite tokens. Use timestamps, a safe error category, and the affected auth operation when diagnosing delivery.


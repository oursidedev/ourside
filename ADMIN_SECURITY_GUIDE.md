# Admin security

Every admin page calls the server-only admin boundary. Every admin API repeats the same authenticated-user check. RLS uses `public.is_admin()` and privacy-safe security-definer RPCs for cross-account metadata.

Normal users cannot read admin tables. Sensitive writes create `admin_audit_logs`; plan writes also create `subscription_plan_changes`. Manual premium grants are support/testing actions. Paid premium must only be activated by verified billing webhooks.

Never expose `SUPABASE_SERVICE_ROLE_KEY`, provider secrets, auth tokens, raw invite tokens, private content or environment values. The system page shows only `configured` or `missing`.

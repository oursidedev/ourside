# Supabase admin schema

Migration `202606200015_admin_dynamic_plans.sql` extends the existing `plans` table and adds:

- `admin_users`, `admin_audit_logs`
- `subscription_plan_changes`, `user_plan_overrides`
- `analytics_visitors`, `analytics_sessions`, `analytics_page_views`, `analytics_events`
- `app_errors`, `notification_logs`

It also adds privacy-safe admin RPCs, `admin_save_plan`, manual-plan override handling, indexes, RLS and dynamic quota triggers. Apply with `npx supabase db push`. The initial owner row is seeded for `ourside.dev@gmail.com`; it can bind by JWT email even before `user_id` is populated.

Do not add broad admin SELECT policies to private content tables. Metadata RPCs deliberately return counts and timestamps rather than emotional content.

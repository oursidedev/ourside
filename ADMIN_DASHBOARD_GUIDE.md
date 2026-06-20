# Ourside admin dashboard

The internal dashboard lives only at `https://app.getourside.com/admin`. The marketing host redirects `/admin` to the app host. Login with an active row in `public.admin_users`; the initial owner email is `ourside.dev@gmail.com`.

Routes cover overview, analytics, users and user details, couples, invites, errors, notifications, billing, plans, storage, system health, audit logs and settings. Admin screens expose operational metadata and counts. They do not render memory notes, letter bodies, private photos, raw storage URLs or invite tokens.

To add an admin, an owner inserts an email and role (`owner`, `admin`, `support`, `readonly`) into `admin_users`. The `ADMIN_EMAILS` environment value is a server-side bootstrap fallback, not a replacement for database authorization.

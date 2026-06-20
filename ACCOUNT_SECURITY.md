# Account security

Password changes require current password, new password and confirmation. The client validates length, mismatch, reuse and common weak values, then re-authenticates the user with Supabase Auth before calling `updateUser`. Passwords are never written to application tables, metadata, notifications or logs.

After success, `record_my_password_change()` writes a non-sensitive audit event and creates an in-app security notification: “If this wasn’t you, secure your account immediately.” Email delivery remains ready through the existing notification provider architecture and activates only when a real provider is configured.

`account_change_logs` records only type, timestamp and safe metadata. Users may read only their own rows. Cooldowns are centralized and checked by database RPCs:

- Avatar: 10 minutes
- Display name: 24 hours
- Password: 10 minutes

Two-factor authentication and active-session revocation are intentionally disabled placeholders until secure enrollment and server-side session management are introduced.

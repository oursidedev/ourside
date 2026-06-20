# Billing and plan limits

`public.plans` is the single source of truth. It contains public prices, regional prices, structured `limits`, structured `features`, presentation fields and publication state. `plans.service.ts` serves public records; `plan-permissions.server.ts` calculates user entitlements; Postgres triggers enforce creation limits.

Enforced resources include memories, media items/upload size/video/originals, letters, albums, milestones and bucket-list items. User plan overrides take precedence, followed by verified subscriptions, then Free. Public cards, checkout and Settings usage consume the same records.

The public endpoint exposes only published plan fields. Provider IDs, audit history and secrets are excluded. Real billing activation remains webhook-authoritative.

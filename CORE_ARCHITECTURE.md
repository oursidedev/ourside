# Ourside core architecture

Ourside remains a Next.js web application, but product rules now live outside route components. The upgrade is additive: current pages, styling, Supabase calls, and route behavior are retained.

## Structure

- `src/app`: Next.js App Router pages, layouts, route handlers, and web navigation.
- `src/components`: web presentation components. These may use DOM and Framer Motion.
- `src/features`: platform-neutral domain types, Zod input schemas, permission helpers, repository contracts, services, and mocks.
- `src/types/core.ts`: IDs, ISO date aliases, locale/theme types, pagination, and service results.
- `src/types/database.ts`: legacy/current UI database shapes retained for compatibility.
- `src/lib/supabase`: web Supabase clients. Service-role credentials must never be imported into client bundles.
- `src/i18n`: English, Turkish, German, Spanish, and French catalogs.
- `supabase/migrations`: versioned database schema, RLS, triggers, and RPC security rules.

## Auth and users

`features/auth/auth.service.ts` is the current web Supabase adapter. Auth contracts and validation are separated in `auth.types.ts` and `auth.schema.ts`. Profiles contain public product metadata only; passwords, provider tokens, and verification state stay in Supabase Auth.

`profiles.id` is also the Supabase Auth user ID, so it is the physical equivalent of `auth_user_id`. `user_preferences` is the existing physical table for the `UserSettings` model. `privacy_settings` is separate because privacy controls are security-sensitive and should evolve independently.

## Couple spaces and invitations

A member belongs to one couple space and database triggers cap a space at two active people. `couple.permissions.ts` supports UI decisions, but RLS and RPCs are authoritative. `partner_invites` is the existing physical table for `PartnerInvitation`; tokens are accepted through security-definer RPCs and expire or are revoked. A token is not proof of database membership by itself.

## Memories and gallery

Memory, media, comment, and reaction contracts are in `features/memories`. Timeline listing is cursor-based and service limits are capped, preventing unbounded fetches. Existing `note`, `author_id`, `location`, and media `url` columns remain compatible; the additive model also supplies `description`, `location_name`, media variants, dimensions, MIME data, and ownership.

Albums use `features/gallery`. `album_memories` remains the join table. Media variant columns are prepared for Part 2; this part does not compress or transform uploads.

## Letters, milestones, bucket list, daily questions

Each feature has typed inputs and repository interfaces. Locked letter bodies require server enforcement: hiding text in a React component is never sufficient. Existing letter RLS restricts reads by author/unlock date. Daily answers remain private per-row and `reveal_daily_answers` returns both answers only after both active partners answer.

Completed bucket-list records can point to a generated memory through `completion_memory_id` (domain name `completedMemoryId`). Milestones may also reference a related memory.

## Notifications

Notifications are persistent in-app records with a typed category, optional couple, metadata, and read timestamp. Email and push are delivery channels to add later, not replacements for the notification record.

## Services and mocks

The current auth, couple, and settings services directly support the working web UI. New domain services depend on repository interfaces, making transport replaceable. `*.mock.ts` files are intentionally small fixtures for stories/tests; production repositories can be added without changing domain models.

## Supabase readiness and security

Migration `202606190006_core_product_foundation.sql` extends the existing schema without renaming or dropping working fields. Private rows use couple-membership RLS. Permission helpers improve UX but do not replace RLS/RPC checks. Use the anon key in clients; keep service-role keys on trusted servers only. Future schema changes should be additive migrations and should retain existing client mappings until every client version has migrated.

Part 2 adds `features/media`: platform-neutral media contracts/services plus browser-isolated compression and a provider-neutral storage adapter. Migration `202606190007_private_media_security_performance.sql` aligns private storage paths, signed access, relationship integrity, and high-frequency indexes.

Part 3 adds `features/billing`: provider-neutral contracts, centralized plan permissions, server composition, development mock state, and payment-provider placeholders. Migration `202606190009_billing_foundation.sql` creates the server-authoritative billing ledger and RLS.

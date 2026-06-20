# Ourside mobile readiness

The application is web-first, but shared product logic is kept outside Next.js route components.

## Shareable modules

- `src/types`: database and domain contracts.
- `src/features`: domain types, repository interfaces, Zod schemas, permission rules, services, and mock fixtures. These files must not import React, DOM APIs, or Next.js.
- `src/lib/validations`, `src/lib/utils`, and future `src/constants`: platform-neutral logic and tokens.
- `src/i18n`: message catalogs and locale definitions.
- `src/data`: replaceable mock repositories and fixtures.
- `src/lib/adapters`: contracts for storage, sharing, uploads, and notifications.

## Web-specific modules

- `src/app` and `src/components` contain Next.js routing and DOM UI.
- `src/lib/supabase/client.ts`, `src/middleware.ts`, and auth callback routes are web adapters. Native should implement the same repository contracts using Expo SecureStore for session persistence.
- Browser APIs stay behind adapters. Do not import `window`, `localStorage`, or DOM file types into feature services.

## Suggested Expo migration

1. Move `src/features`, `src/types/core.ts`, schemas, utilities, translations, constants, and tokens into `packages/core` in a workspace. Preserve import boundaries while moving.
2. Create an Expo Router app consuming domain types, Zod schemas, translations, tokens, and services.
3. Implement native storage/session, media upload, share, clipboard, and notification adapters. Do not add `window` checks inside domain services.
4. Keep Supabase tables and repository contracts consistent; use React Native session persistence and deep-link auth callbacks.
5. Mirror design tokens through NativeWind or a typed token package, not copied Tailwind strings.

## Recommended native capabilities

- Push: Expo Notifications, per-device tokens with revoke timestamps, and Supabase Edge Functions for letter/date reminders. Treat notification payloads as untrusted input.
- Camera/media: Expo Camera and ImagePicker, on-device compression, adapter-based uploads, and consent before retaining EXIF.
- Uploads: implement the same prepared-variant and `StorageAdapter` contracts with native file URIs; persist an idempotent offline queue and use background tasks only after session refresh.
- Caching: Expo FileSystem with a bounded index; encrypt drafts and avoid indefinitely caching unlocked letters.
- Deep links: verified universal/app links for partner invites, auth callbacks, memories, and letter unlocks. Validate invite tokens server-side after session restoration.
- Billing: share plan/permission contracts, but keep StoreKit and Play Billing adapters native. Server-validated store transactions update the same subscriptions table used by web.
- Release: privacy manifests, permission rationale, account deletion and export, accessibility QA, store assets, staged TestFlight/Internal Testing, crash reporting, and incident response.

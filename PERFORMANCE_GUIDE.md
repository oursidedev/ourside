# Ourside performance guide

## Instant interaction feedback

- Open dialogs and sheets synchronously; load their data inside with skeletons.
- Set pending or disabled state before awaiting network work and reject duplicate submissions.
- Use Next.js `Link` for static navigation so likely routes are prefetched automatically.
- Apply optimistic local state to safe actions such as favorites, filters, answers and preview-only creation; report failures with a toast.
- Keep clipboard, navigation and modal handlers lightweight. Image compression and upload preparation must begin after the composer is visible.
- Preserve pressed states and 44px touch targets so mobile taps are acknowledged immediately.
- Never add artificial delays to actions. Skeletons represent real loading only.

## Current strategy

- Next.js routes split feature bundles automatically; interactive code remains in focused client components.
- `next/image` supplies responsive sizing and lazy loading for below-the-fold gallery assets.
- Timeline repository contracts require cursor pagination and cap pages at 50 rows.
- Media is resized before network transfer. Lists use thumbnails, cards use medium variants, and detail pages use large variants.
- Signed URLs are cached in memory and refreshed in the background before expiry.
- Composite Postgres indexes match couple timelines, unread notifications, albums, letters, reminders, and relation lookups.
- Upload UI yields between variants, responds immediately, and exposes progress, removal, cancellation, retry, and failure states.

## Data and cache rules

Select only fields required by the surface. Cache profile, couple membership, settings, and signed URLs with explicit expiry. Mutation services should update local cached entities optimistically, then rollback on failure. Repository interfaces are compatible with a future TanStack Query layer for both web and React Native.

Always paginate memories, gallery records, letters, and notifications. Use `(date DESC, id DESC)` cursors rather than large offsets. Do not render hundreds of masonry items at once; introduce windowing when a page can exceed roughly 100 visible cards.

## What not to do

- Do not load originals in grids or timeline cards.
- Do not upload raw camera photos without validation/compression.
- Do not render unlimited memories or join every relation into one query.
- Do not persist signed URLs or make private buckets public.
- Do not import browser compressors into Server Components or native shared code.
- Do not add global state for data that can remain route-local or server-rendered.
- Do not make animations a prerequisite for interaction; honor reduced motion.

## Testing

Run `npm run typecheck` and `npm run build`. Test throttled mobile network/CPU in browser tooling, verify responsive image requests, inspect JS route chunks, and measure LCP/INP/CLS with Lighthouse and real-user monitoring. Upload tests should cover 10/25 MB boundaries, cancellation, offline failure, retry, and low-memory devices.

## Scaling plan

At higher volume, add a durable upload-session table, background media jobs, orphan cleanup, CDN-signed delivery, and virtualized gallery views. Monitor slow Postgres queries and RLS plans before adding indexes; unused indexes add write cost. Mobile should use bounded encrypted caches, native thumbnails, resumable/background uploads, and avoid decoding multiple full-resolution images simultaneously.
# Transition and loading performance

- Route entrance animation is limited to opacity and an 8 px transform for 200 ms.
- Never delay navigation to finish an exit animation.
- Keep the app shell mounted and skeleton only the changing content.
- Skeletons use lightweight CSS shimmer and a fixed small item count.
- Show pending state before network work and never await before visible click feedback.
- Respect `prefers-reduced-motion`; decorative loaders become static.
- Avoid full-screen blocking loaders when a section-level skeleton is possible.

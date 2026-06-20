# Ourside media architecture

## Upload flow

1. `ImageUploadDropzone` displays an immediate local blob preview and validates the plan's source-size limit.
2. The browser-only `imageCompression.ts` decodes orientation, resizes with high-quality canvas sampling, and re-encodes the pixels. Re-encoding removes EXIF and other unnecessary metadata.
3. It creates thumbnail (300 px), medium (900 px), large (1600 px), and a 32 px blur placeholder. AVIF is selected when the browser can encode it, WebP is preferred next, and JPEG is the fallback.
4. Free accounts do not retain the original. Plus/Lifetime may retain it; media limits now import the centralized billing permission constants.
5. `MediaService` uploads variants through `StorageAdapter`, rolls back partial uploads on failure, and reports progress. Screens receive retry/cancel/error states instead of blocking.
6. A `memory_media` row stores provider paths, MIME/size/dimensions, and the blur data URL. Database creation should occur after all required variants upload successfully.

Never use original images in grids. Gallery/list surfaces use thumbnails, cards use medium, detail pages use large, and original is reserved for an authorized download/export.

## Private storage

The `couple-media` Supabase bucket is private. Paths are immutable and scoped as:

`couples/{coupleId}/memories/{memoryId}/{mediaId}/{variant}.{extension}`

Storage RLS extracts the couple ID and verifies membership. Clients receive short-lived signed URLs (15 minutes by default), cached only in memory until shortly before expiry. Do not store signed URLs in database rows or localStorage.

The anon client may request a signed URL because Storage RLS still evaluates the user's session. Service-role keys are server-only and are not needed for ordinary uploads or reads.

## Provider and CDN migration

UI and domain services depend on `StorageAdapter`, not Supabase APIs. A future R2/S3 adapter should request presigned operations from a trusted server. Migrate objects in the background, retain logical paths in `memory_media`, then switch the provider adapter. Do not make the bucket public merely to place a CDN in front of it; use authenticated image delivery or signed CDN URLs.

## Video preparation

Video metadata is modeled now, but processing is intentionally deferred. Free plans reject video. Future uploads should go directly to private object storage, enqueue server-side transcode jobs, generate poster thumbnails and adaptive playback renditions, then update `thumbnail_url`/`playback_url`. Never transcode large video in the browser.

## Mobile and offline uploads

Expo should implement a native compressor/image-picker adapter that produces the same variant contract. Persist queue metadata in an encrypted local database, keep original device file URIs until completion, refresh auth before background upload, and use idempotent media IDs so retries cannot create duplicates. Blob URLs and Canvas are web-only.

## Cost controls

- Compress before upload and cap source size at 10 MB Free / 25 MB paid.
- Retain originals only when entitled.
- Use thumbnails in lists and bounded pagination.
- Remove partially uploaded variants after failure.
- Add lifecycle rules for abandoned uploads once server upload sessions are introduced.

# Profile management

Profile rules live in `src/features/users`; browser-only canvas processing is isolated in `avatar.client.ts`.

## Avatar flow

1. Validate JPEG, PNG, WebP or AVIF and a maximum 5 MB source.
2. Show a local preview immediately.
3. Center-crop and strip metadata by canvas re-encoding.
4. Create 96, 256 and 512 pixel WebP variants.
5. Upload privately to `profile-media/users/{userId}/avatar/avatar-{size}.webp`.
6. Commit the medium path through a security-definer RPC and refresh its signed URL.

Partners may read each other’s signed private avatar through Storage RLS. Other users cannot. When no image exists, the UI derives up to two initials from the display name.

Avatar changes have a server-enforced 10-minute cooldown. Display names are normalized, limited to 2–40 characters, require a letter/number and accept letters, numbers, spaces, apostrophes, dots and hyphens. Display-name changes have a server-enforced 24-hour cooldown.

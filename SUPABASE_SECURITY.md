# Ourside Supabase security

## RLS model

RLS is enabled on profiles, preferences/privacy, couples, memberships, invitations, memories/media/comments/reactions, albums, letters, milestones, bucket items, daily answers, and notifications. Product permission helpers only improve UI; PostgreSQL policies and security-definer RPCs are authoritative.

- Profiles are visible to their owner and current partner because the shared UI needs partner identity; updates remain owner-only.
- Couple data requires `is_couple_member(couple_id)`. A trigger limits each space and prevents cross-space membership.
- Memory access requires membership. Private memories and their media are visible only to their author.
- Child-row triggers derive `couple_id` from the parent memory, preventing forged couple IDs.
- Notification and settings rows are owner-only.
- Invitation acceptance and two-partner checks run inside locked database RPCs.

## Private storage and signed URLs

`couple-media` is private. Storage paths begin with `couples/{coupleId}` and RLS validates that segment as a UUID and checks membership. Upload paths also enforce memory/media/variant structure. A public asset URL must never be written for couple media.

Signed URLs are capabilities with short expiry. Generate them as the authenticated user so RLS applies, cache only until shortly before expiry, and avoid placing them in analytics, logs, notifications, or persistent tables.

## Locked letters

Recipient clients list letter metadata through `get_letter_previews`, which never returns `encrypted_body`. Direct letter reads remain restricted by membership, sender ownership, and unlock time. When encryption-at-rest/application encryption is expanded, keys must remain in trusted server infrastructure; hiding a body field in React is not security.

## Key rules

The browser and mobile app use only the Supabase URL and anon key. Service-role keys bypass RLS and must exist only in protected server/Edge Function environments. Never prefix service-role secrets with `NEXT_PUBLIC_`, return them from an API, or import a service-role module into a client component.

## Operational checks

Review every new table with RLS enabled and no unintended public grants. Test policies using two unrelated users, both partners, expired/revoked invites, private memories, and locked letters. Keep migrations additive, run Supabase Security Advisor, rotate leaked secrets immediately, and audit signed URL and export endpoints.

Billing subscriptions/payments are readable only by the purchasing user or applicable couple. They have no client write policy. `billing_events` has no client policy at all; verified webhook infrastructure processes it with server-only credentials and unique event IDs.

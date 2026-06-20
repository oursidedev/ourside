# Partner invitation system

Ourside supports two representations of one invitation record:

- A UUID token for direct links: `/invite/[token]`
- A short human-readable code such as `OURS-7KQ9` for `/join`

The displayed link uses the current browser origin, so local, preview and production deployments require no hardcoded domain.

## Creating and managing an invite

`PartnerInviteCard` opens immediately, then asks `coupleService` for an active invitation. If none exists, the database RPC creates one. Regeneration revokes outstanding invites before creating a new token/code pair. Revocation invalidates both representations. Invites expire after seven days and couple membership is capped at two in the database.

Copy operations use `src/lib/utils/clipboard.ts`, which prefers the Clipboard API and falls back to a temporary textarea for compatible mobile and legacy browsers.

## Joining

Token links use `get_partner_invite_preview` and `accept_partner_invite`. Short codes use `get_partner_invite_preview_by_code` and `accept_partner_invite_by_code`. Unauthenticated users retain the return route through login/signup. After authentication, acceptance inserts the user into the invited couple; it does not create another Ourside.

Codes are trimmed, uppercased and compared after removing separators. Invalid codes return a not-found message. Expired, revoked, accepted or full-space invitations return a no-longer-valid state. Existing database rules reject users who already belong to a different couple.

## Security and Supabase

Migration `202606200011_partner_invite_codes.sql` adds the unique code, status synchronization and RPCs. Acceptance and the two-member limit are enforced by security-definer database functions with explicit grants, not by UI state. Raw couple IDs are not exposed in invitation URLs. Production should add edge or WAF rate limiting to public preview lookups and monitor repeated code guesses.


# Ourside interaction audit

Checked on 20 June 2026. Active-looking controls must navigate, update local/Supabase state, open UI immediately, or explain an unavailable action.

## Pages checked

- Marketing, pricing, login, signup, password reset and profile completion
- Onboarding, dashboard, memories list/composer/detail, gallery, vault, milestones and bucket list
- Settings, billing, invite-token acceptance, invite-code join and checkout states
- Desktop sidebar/header and mobile bottom navigation

## Actions fixed

- Global toasts now cover copy, settings, mock creation/update/delete, favorites and unavailable actions.
- Partner CTAs open the invite dialog through `/settings?invite=1`; the dialog opens before its request starts.
- Invite links and codes copy from either the value or copy button, with visual copied state.
- Invite regeneration/revocation, token acceptance and code acceptance call the couple service.
- Onboarding style and cover controls now update visible state; the preview no longer invents a partner.
- Gallery toggle/filter/lightbox/upload, memory search/filter/detail/edit/delete/comment, vault compose, milestone add, bucket-list add/complete/filter and daily-answer actions respond immediately.
- Settings profile/security/couple/preferences/export/danger actions report pending and result states.
- Notification, advanced-filter and album-detail controls explain their intentionally unavailable state.

## Navigation checks

- Static navigation uses Next.js links and default route prefetching.
- Marketing CTAs lead to signup, experience sections or pricing.
- App navigation targets `/dashboard`, `/memories`, `/gallery`, `/vault`, `/milestones`, `/bucket-list`, and `/settings`.
- Partner-dependent items are visibly locked until the second member joins.
- Mobile bottom navigation uses the same access rules and valid routes as desktop.

## Intentionally limited

- Notification center, advanced gallery/memory filters, and album detail pages show a clear coming-soon toast.
- Memories, vault letters, milestones and bucket-list items persist to the couple-scoped Supabase tables and refresh through Realtime for both partners.
- Billing remains development/mock-only and never activates production access from the client.
- The onboarding cover selection is acknowledged locally; private media upload remains a separate post-setup operation.

## Manual device checklist

- Touch targets are at least 44px where controls are primary.
- Invite UI becomes a bottom sheet on small screens and a dialog on desktop.
- Invite values do not widen the viewport; copy actions do not depend on hover.
- Join form submits with Enter and uses a paste-friendly, uppercase code field.
- Dialog backdrop and close controls work; invite dialog also closes with Escape.
# Loading and dialog audit

- Browser-native alert/confirm/prompt calls removed from normal app UX.
- Memory deletion, invite revocation and subscription cancellation use the shared destructive dialog.
- Existing account deletion/disconnect actions retain branded in-app confirmation UI.
- Dashboard, memories, gallery, vault, memory detail, invite and join loading states checked.
- Async primary buttons support stable inline loading and duplicate-submit prevention.
- Toasts support success, error, warning, info and loading states and avoid the mobile bottom navigation.
- Route progress and content transitions provide immediate navigation feedback.

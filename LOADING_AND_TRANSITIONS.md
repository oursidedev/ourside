# Loading and transitions

Ourside keeps the persistent app shell mounted while route content changes. `PageTransition` applies a 200 ms opacity/upward transition keyed by pathname; reduced-motion users receive no entrance animation. `NavigationFeedback` gives links immediate top-edge progress feedback.

## Loading strategy

- Use route `loading.tsx` files when a route segment itself is being fetched.
- Use a layout-matched skeleton when the content shape is known. Dashboard, memory cards, gallery, vault, settings and forms share the warm `ourside-skeleton` treatment.
- Use `LoadingOrb` or `AppLoader` only for unknown-duration, app-level states such as auth redirects or opening a single memory.
- Keep the sidebar, header, notification bell and mobile navigation mounted. Loading should normally affect only the content region.
- Client repositories must set loading state before awaiting network work and clear it in `finally`.

Skeletons use CSS transforms/background positioning, contain no images, and render only a small fixed number of placeholders. Mobile layouts preserve touch targets and safe-area spacing. Desktop skeletons mirror the final grid to limit layout shift.

`PremiumButton` accepts `loading` or `ariaBusy`. It keeps its dimensions stable, shows an inline loader immediately and prevents duplicate submission.

# Ourside billing architecture

## Model and permission source

Ourside uses `Plan`, `Subscription`, `Payment`, and `BillingEvent` domain contracts. `billing.constants.ts` is the only source for plan limits, while `billing.permissions.ts` resolves effective access and exposes `canUseFeature` / `getPlanLimit`. Media limits import these constants, so upload behavior cannot drift from billing rules.

Free includes 50 photos, 3 albums, 3 future letters, 10 MB source images, and no originals/video/voice/premium themes/yearbook. Plus and Lifetime share premium capabilities and a 25 MB source limit; Lifetime has no recurring period.

Frontend gating improves UX only. Protected server operations must read the current `subscriptions` row and repeat permission checks. A plan is effective only while its verified subscription is active/trialing and within its period.

## Provider boundary

UI code never imports provider SDKs. `BillingProviderAdapter` supports checkout, customer portal, cancellation, and webhooks. `billing.server.ts` composes the configured server provider. Placeholder modules document iyzico, Paddle, Lemon Squeezy, Stripe, Apple, and Google integration boundaries without API calls or secrets.

Web providers should use hosted checkout so Ourside never handles raw card data. Provider SDKs must be dynamically loaded only on checkout surfaces.

## Mock billing

`MockBillingProvider` is development-only. Production builds reject it regardless of cookie or environment input. In development, Settings exposes Free/Plus/Lifetime and expired-state simulation through an authenticated route and HTTP-only mock cookie. This is disposable test state, not a payment or production entitlement.

Mock checkout returns a pending success URL. It intentionally does not activate premium. The Settings mock control represents a simulated verified backend state.

## Production webhook flow

1. Provider creates a hosted checkout session on the server.
2. Redirect success shows “confirmation pending” and changes no entitlement.
3. Provider sends a signed webhook to a server route.
4. The server verifies the signature using the raw request body.
5. Insert `(provider,event_id)` into `billing_events`. Its unique constraint makes retries idempotent.
6. In one transaction, update subscription/payment rows and mark the event processed.
7. Clients revalidate current subscription state.

Never activate premium from query parameters, redirects, client cookies, or unverified webhook JSON. `billing_events` is server-only under RLS. Service-role credentials belong only in protected webhook/Edge Function infrastructure.

## Adding providers

- **iyzico:** map Turkish hosted checkout/payment callbacks, verify signatures, and normalize events into subscriptions/payments.
- **Paddle / Lemon Squeezy:** use merchant-of-record checkout and verified subscription webhooks; map tax-inclusive regional prices.
- **Stripe:** use Checkout and Customer Portal if available; do not use raw card Elements unless compliance requirements are deliberately accepted.
- **Apple / Google:** validate signed transactions/purchase tokens server-side and map store product IDs to the same plan slugs and permissions.

Provider customer/subscription/payment identifiers are indexed and unique where appropriate. Never store PAN, CVC, or raw card payloads.

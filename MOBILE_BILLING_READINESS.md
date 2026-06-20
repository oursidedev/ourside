# Mobile billing readiness

## Web versus mobile

Web checkout may use iyzico or a global merchant-of-record provider. iOS digital subscriptions generally use Apple In-App Purchase and Android uses Google Play Billing. Provider-specific UI and SDKs remain native, while plan slugs, subscription records, limits, and permission functions remain shared.

## Apple IAP

Create App Store products for monthly/yearly Plus and, only if store policy permits, Lifetime. The app sends signed transaction data to a trusted server. The server validates with Apple, stores the original transaction identifier as the provider subscription ID, records an idempotent billing event, and updates the shared subscription. Handle renewals, grace periods, revocations, refunds, and restore purchases.

## Google Play Billing

Map Play product/base-plan IDs to Ourside plan slugs. Send the purchase token to a trusted server; validate it with Google Play Developer APIs, acknowledge purchases where required, persist the token-derived provider ID, and process Real-time Developer Notifications idempotently.

## Shared access

Both stores update the same `subscriptions` model. Web and mobile call the same `effectivePlan`, `canUseFeature`, and `getPlanLimit` logic after fetching server state. Device receipt state is never authoritative. A couple-linked subscription can grant shared access according to RLS while retaining the purchasing user for support/refund records.

Future work includes store entitlement reconciliation, account-transfer rules, family/shared-space policy, restore-purchase UX, price localization from StoreKit/Play, deep links, sandbox testing, and App Store/Play disclosures.

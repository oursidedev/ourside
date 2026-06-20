# Push notification readiness

`PushProvider` is the shared boundary for future Web Push, FCM, OneSignal and Expo Push. `notification_devices` stores web/iOS/Android tokens with provider, device name, last-seen and revocation state. Client helpers register and revoke the current user's tokens through RLS.

Future mobile work:

- Expo clients should request permission only after a clear user action, register the Expo token and validate receipts in a server worker.
- Native FCM/APNs implementations should map one database notification to all active user devices without duplicating notification history.
- Web Push should use a service worker and a non-intrusive opt-in prompt from settings, never on first page load.
- Deep links should map authenticated action URLs to Expo Router and web routes.
- Invalid tokens must be revoked after provider feedback; raw tokens must never enter logs or analytics.

Push remains disabled until a real provider, receipt validation, privacy copy and platform permission UX are configured.

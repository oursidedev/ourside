# Email notification guide

`EmailProvider` isolates vendor code. The project includes a development mock and placeholders for Resend, SendGrid, Postmark and Brevo. No SDK or provider key is included in the client bundle.

`renderNotificationEmail` produces branded HTML and text with a single authenticated CTA. Templates include only safe summary copy. Never include a locked letter body, memory description, signed media URL, password information or invitation secrets in general activity emails.

To add a provider:

1. Implement `EmailProvider` in a server-only module and dynamically load its SDK.
2. Read its API key only from server environment variables.
3. Change pending/skipped delivery processing in a trusted worker.
4. Verify provider responses and webhooks, then update `notification_delivery_logs`.
5. Retry failed records with bounded backoff and preserve the event dedupe key.
6. Check `notification_preferences` and `email_unsubscribes` immediately before every send.

Transactional security messages may use a separate legally reviewed policy. Marketing must remain explicit opt-in.


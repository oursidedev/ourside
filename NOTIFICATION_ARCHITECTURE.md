# Ourside notification architecture

Notifications use three channels: `in_app`, `email`, and `push`. In-app delivery is live. Email is provider-ready and records skipped mock deliveries until a server provider is configured. Push models and adapters are prepared but disabled.

## Event flow

Feature repositories call `dispatchNotificationEvent` only after their main write succeeds. The client sends an event type and source reference, never a recipient or notification body. Supabase RPC `dispatch_notification_event` verifies membership, resolves the other active couple member, applies preferences, creates the event and notification, and writes delivery logs.

`notification_events.dedupe_key` is unique. Its shape is `type:source-or-couple:recipient`; retries therefore cannot create duplicate notification history or delivery attempts. Actors do not receive partner-activity notifications. Explicit confirmation events may target the actor.

Account and couple membership lifecycle notifications are database-triggered so they cannot be skipped by a client disconnect. Feature events currently cover memories, comments, future letters, milestones and bucket-list changes. Billing and daily-question event types are reserved for their production workflows.

## Security and privacy

- Clients cannot insert notifications or notification events directly.
- RLS restricts notification history, preferences, devices and delivery records to their owner.
- Action URLs lead to authenticated app routes.
- Locked letter bodies, memory descriptions and private media URLs are never placed in notification copy.
- Email unsubscriptions override email preferences. Marketing defaults off in the UI.
- Provider and service-role credentials must remain server-only.

## UI and performance

The bell opens before loading data, shows a skeleton, unread badge, optimistic read/archive actions, Realtime updates and a mobile bottom sheet. Lists are capped at 30 by default and 50 maximum. Realtime signals trigger a scoped reload rather than storing private payloads globally.

## Scheduled work

`process_due_letter_unlock_notifications`, `process_upcoming_milestone_reminders`, and `process_daily_question_notifications` are scheduler boundaries. Run them from Supabase Cron/Edge Functions, Vercel Cron or a worker. Letter unlock processing is implemented; milestone and daily-question functions intentionally return zero until scheduling rules are finalized.


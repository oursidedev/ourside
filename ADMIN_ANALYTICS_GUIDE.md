# First-party analytics

The web tracker creates anonymous visitor and session UUIDs, records sanitized pathname-only page views, and sends a heartbeat every 30 seconds. A session is live when `last_heartbeat_at` is within 60 seconds. Marketing and app domains are stored separately.

Query strings, invite/reset tokens, private content, filenames, auth data and letter or memory bodies are never collected. Disable collection with `NEXT_PUBLIC_ANALYTICS_ENABLED=false`. Mobile clients can reuse the event contract but should provide a native storage adapter.

# Error monitoring

Client runtime errors are reported with a compact fingerprint, sanitized path, domain and operational session identifiers. Stack traces and application payloads are not accepted from anonymous clients. Admins can review `open`, `investigating`, `resolved` and `ignored` records without seeing private couple content.

Future server integrations should sanitize messages before storage and group occurrences by fingerprint. Provider API keys and raw request bodies must never be logged.

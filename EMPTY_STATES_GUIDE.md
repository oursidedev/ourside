# Empty states

The shared `EmptyState` component provides the warm illustration treatment, title, descriptive copy, primary action and optional secondary action. It renders as a compact mobile card and a restrained desktop panel.

Implemented states:

- Memories: add the first memory or open partner invitation settings.
- Memory search: clear the query and reset the active filter.
- Gallery: create a memory; photo memories appear automatically.
- Vault: open the existing future-letter composer.
- Milestones: open the milestone form.
- Bucket list: open the shared-plan form.
- Notifications: the existing notification panel explains what will appear there.

Use an empty state instead of redirecting when the user can resolve the condition in context. Setup-required couple routes continue to use the app shell’s create/join/invite guidance. Copy should explain the next useful action and never say only “No data”.

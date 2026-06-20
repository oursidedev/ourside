# Dialog system

`DialogProvider` is mounted in the root layout and exposes `useAppDialog()`:

```tsx
const { confirm, info, prompt } = useAppDialog();
const accepted = await confirm({
  title: "Delete this memory?",
  description: "This cannot be undone.",
  confirmLabel: "Delete memory",
  cancelLabel: "Keep memory",
  tone: "destructive",
});
```

- `confirm` handles ordinary, warning and destructive decisions.
- `info` replaces native alerts for important app messages.
- `prompt` provides validated text input without browser chrome.
- Dialogs render as a mobile bottom sheet and centered desktop modal.
- Escape/backdrop cancel, focus is trapped, focus returns to the trigger, and dialog labels are connected with ARIA.

Do not introduce `window.alert`, `window.confirm`, `window.prompt`, or their global equivalents. Use a toast for transient feedback, `info` when acknowledgement matters, and `confirm` only when a decision is required.
